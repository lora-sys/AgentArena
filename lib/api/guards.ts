import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import PQueue from "p-queue";

/**
 * API guards — rate limiting, input validation, and path-param format checks.
 *
 * Addresses reviewer-3 HIGH findings #2 (no rate limiting) and #3 (SSE accepts
 * arbitrary `id` without format validation). All guards return NextResponse
 * directly so route handlers can early-return without wrapping.
 */

/* ------------------------------------------------------------------ */
/* Battle ID format validation                                         */
/* ------------------------------------------------------------------ */

/**
 * Crockford base32 alphabet: 0-9 A-Z, excluding I, L, O, U.
 * Matches PRD §8: battle IDs follow `btl_<8-char base32>`.
 */
const BATTLE_ID_PATTERN = /^btl_[0-9A-HJKMNP-TV-Z]{8}$/;

/**
 * Validates that a string is a well-formed battle ID.
 * Format: `btl_<8-char base32>` per PRD §8.
 */
export function validateBattleId(id: unknown): id is string {
  return typeof id === "string" && BATTLE_ID_PATTERN.test(id);
}

/* ------------------------------------------------------------------ */
/* Idea validation                                                     */
/* ------------------------------------------------------------------ */

const IDEA_MIN = 10;
const IDEA_MAX = 2000;
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

export type IdeaValidationResult = { ok: true; value: string } | { ok: false; error: string };

/**
 * Validates user-supplied battle idea text.
 * Rules: 10-2000 chars after trim, no control characters.
 */
export function validateIdea(idea: unknown): IdeaValidationResult {
  if (typeof idea !== "string") {
    return { ok: false, error: "idea must be a string" };
  }

  const trimmed = idea.trim();

  if (trimmed.length < IDEA_MIN) {
    return { ok: false, error: `idea must be at least ${IDEA_MIN} characters` };
  }

  if (trimmed.length > IDEA_MAX) {
    return { ok: false, error: `idea must be at most ${IDEA_MAX} characters` };
  }

  if (CONTROL_CHAR_PATTERN.test(trimmed)) {
    return { ok: false, error: "idea must not contain control characters" };
  }

  return { ok: true, value: trimmed };
}

/* ------------------------------------------------------------------ */
/* Rate limiting — in-memory token bucket                              */
/* ------------------------------------------------------------------ */

export type RateLimitOptions = {
  /** Max requests allowed within the window. Default 10. */
  max?: number;
  /** Window size in milliseconds. Default 60_000 (1 minute). */
  windowMs?: number;
};

type Bucket = { tokens: number; lastRefill: number };

// Module-level map keyed by client key (IP + route).
// Suitable for single-process dev/Vercel-serverless usage. For
// multi-instance production, swap for Redis or Vercel KV — the
// public API (withRateLimit) stays the same.
const buckets = new Map<string, Bucket>();

// Periodic cleanup of expired buckets to prevent unbounded memory growth.
// Runs at most once every CLEANUP_INTERVAL_MS to avoid overhead.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredBuckets(now: number, windowMs: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    // If the bucket has been idle long enough to fully refill, remove it.
    // idle time >= windowMs means tokens would be clamped to max anyway.
    if (now - bucket.lastRefill >= windowMs) {
      buckets.delete(key);
    }
  }
}

/**
 * Validates that a string looks like a plausible IP address (v4 or v6).
 * Prevents header injection / spoofing via non-IP garbage in forwarded headers.
 */
const IP_PATTERN =
  /^(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4})$/;

/**
 * Extracts a client IP from request headers. Only accepts values that look
 * like valid IP addresses to prevent spoofing. Falls back to "unknown" when
 * no valid IP is available.
 */
function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Vercel *appends* to x-forwarded-for, so the last hop is the trusted one.
    // The first value is attacker-controlled and must not be trusted alone.
    const hops = forwarded.split(",");
    for (let i = hops.length - 1; i >= 0; i -= 1) {
      const hop = hops[i]?.trim();
      if (hop && IP_PATTERN.test(hop)) {
        return hop;
      }
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && IP_PATTERN.test(realIp)) {
    return realIp;
  }
  return "unknown";
}

/**
 * Wraps a route handler with in-memory token-bucket rate limiting.
 * Returns 429 with a Retry-After header when the bucket is empty.
 *
 * The second `context` argument is typed as `unknown` because Next.js
 * route handlers receive a context object whose shape varies by route
 * (`{ params }` for dynamic routes). Route handlers should narrow it
 * inside the handler body.
 */
export function withRateLimit<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response> | Response,
  options: RateLimitOptions = {},
): (request: Request, ...args: Args) => Promise<Response> {
  const max = options.max ?? 10;
  const windowMs = options.windowMs ?? 60_000;

  return async (request: Request, ...args: Args): Promise<Response> => {
    const clientKey = getClientKey(request);
    // Key bucket by client + route method+url so different routes
    // don't share their rate-limit budget (prevents test suite poisoning
    // where one route's requests exhaust the bucket for another route).
    const routeKey = `${request.method}:${new URL(request.url).pathname}`;
    const key = `${clientKey}|${routeKey}`;
    const now = Date.now();

    // Periodic cleanup to prevent unbounded memory growth.
    cleanupExpiredBuckets(now, windowMs);

    const bucket = buckets.get(key);

    if (!bucket) {
      // First request from this key: bucket starts full minus the
      // request we're about to serve.
      buckets.set(key, { tokens: max - 1, lastRefill: now });
      return handler(request, ...args);
    }

    // Continuous refill: regenerate tokens proportional to elapsed time.
    // tokensPerMs = max / windowMs, so a fully-drained bucket refills
    // to `max` over exactly `windowMs`. No all-or-nothing burst at
    // a window boundary.
    const elapsed = now - bucket.lastRefill;
    const refilled = bucket.tokens + (elapsed * max) / windowMs;
    const tokens = Math.min(max, refilled);

    if (tokens < 1) {
      // Not enough tokens — compute retry-after as the time needed
      // to accrue 1 token.
      const tokensNeeded = 1 - tokens;
      const msUntilRefill = Math.ceil((tokensNeeded * windowMs) / max);
      const retryAfter = Math.max(1, Math.ceil(msUntilRefill / 1000));
      bucket.lastRefill = now;
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }

    bucket.tokens = tokens - 1;
    bucket.lastRefill = now;
    return handler(request, ...args);
  };
}

/* ------------------------------------------------------------------ */
/* Global concurrency limit — p-queue                                 */
/* ------------------------------------------------------------------ */

/**
 * Module-level p-queue shared across all routes that opt in to global
 * concurrency limiting. This caps the total number of in-flight
 * long-running battle operations (OpenAI calls, event-store writes) to
 * prevent resource exhaustion when many battles run simultaneously.
 *
 * Default maxConcurrent is 6 per PM recommendation.
 */
const globalQueue = new PQueue({ concurrency: 6 });

export type ConcurrencyOptions = {
  /** Max concurrent in-flight requests across all routes using the global queue. Default 6. */
  maxConcurrent?: number;
};

/**
 * Wraps a route handler with global concurrency limiting via p-queue.
 * When the queue is full, excess requests are queued (FIFO) and resolved
 * when a slot frees up. This protects downstream resources (OpenAI
 * API, Postgres) from simultaneous overload.
 *
 * Pattern mirrors `withRateLimit`: the handler signature is unchanged,
 * so existing route handlers can opt in by wrapping the exported method.
 */
export function withGlobalConcurrency<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response> | Response,
  options: ConcurrencyOptions = {},
): (request: Request, ...args: Args) => Promise<Response> {
  const concurrency = options.maxConcurrent ?? 6;

  // If a different concurrency is requested, create a dedicated queue
  // so per-call overrides don't disturb the module-level default.
  const queue = concurrency === 6 ? globalQueue : new PQueue({ concurrency });

  return async (request: Request, ...args: Args): Promise<Response> => {
    return queue.add(() => handler(request, ...args)) as Promise<Response>;
  };
}

/**
 * Wraps a route handler with Zod-based body validation.
 * Returns 400 with a list of validation issues when the body is invalid.
 *
 * The trailing `...args` carry the Next.js context object unchanged
 * (typed as `unknown[]` so route handlers can narrow in their body).
 */
export function withInputValidation<T, Args extends unknown[]>(
  schema: ZodSchema<T>,
  handler: (data: T, request: Request, ...args: Args) => Promise<Response> | Response,
): (request: Request, ...args: Args) => Promise<Response> {
  return async (request: Request, ...args: Args): Promise<Response> => {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return NextResponse.json(
        { error: "Input validation failed", issues },
        { status: 400 },
      );
    }

    return handler(result.data, request, ...args);
  };
}

/* ------------------------------------------------------------------ */
/* Battle cancellation — AbortController registry                      */
/* ------------------------------------------------------------------ */

/**
 * Module-level map of AbortControllers keyed by battle ID.
 * The cancel route posts to this registry to signal an in-flight
 * OpenAI request to abort. After the request finishes (success or
 * error), the controller is cleaned up via clearAbortController().
 *
 * Cancel works by aborting the in-flight OpenAI request + falling back
 * to mock for remaining rounds. See lib/runtime/mastra.ts for the
 * AbortSignal threading.
 */
const abortControllers = new Map<string, AbortController>();

/**
 * Register an AbortController for a battle ID. The runtime calls this
 * when a battle starts so the cancel endpoint has a target to signal.
 * Returns the controller so the runtime can pass its signal to OpenAI.
 */
export function registerAbortController(battleId: string): AbortController {
  const existing = abortControllers.get(battleId);
  if (existing) {
    // Replace any stale controller from a previous run.
    existing.abort();
  }
  const controller = new AbortController();
  abortControllers.set(battleId, controller);
  return controller;
}

/**
 * Signal cancel for a battle. Triggers the AbortController so any
 * in-flight OpenAI request is cancelled. Returns true if a controller
 * was found, false if no battle is currently running for that ID.
 */
export function cancelCurrentBattle(battleId: string): boolean {
  const controller = abortControllers.get(battleId);
  if (!controller) {
    return false;
  }
  controller.abort();
  return true;
}

/**
 * Remove a battle's AbortController from the registry. Call this when
 * a battle finishes (success, failure, or already-cancelled) to prevent
 * unbounded memory growth.
 */
export function clearAbortController(battleId: string): void {
  abortControllers.delete(battleId);
}

/* ------------------------------------------------------------------ */
/* Test helpers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Test-only: clear all in-memory rate-limit buckets.
 * Used by e2e test setup to reset state between tests.
 * Must NOT be called from production code.
 */
export function __resetRateLimit(): void {
  buckets.clear();
  lastCleanup = Date.now();
}

/**
 * Test-only: clear the abort-controller registry.
 * Used by e2e test setup to reset state between tests.
 */
export function __resetAbortControllers(): void {
  for (const controller of abortControllers.values()) {
    controller.abort();
  }
  abortControllers.clear();
}

/* ------------------------------------------------------------------ */
/* Response helpers                                                    */
/* ------------------------------------------------------------------ */

/** Returns a 400 JSON response with a structured error. */
export function badRequest(message: string, issues?: string[]): NextResponse {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}
