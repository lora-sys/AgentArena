import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

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

type Bucket = { tokens: number; resetAt: number };

// Module-level map keyed by client key (IP + route).
// Suitable for single-process dev/Vercel-serverless usage. For
// multi-instance production, swap for Redis or Vercel KV — the
// public API (withRateLimit) stays the same.
const buckets = new Map<string, Bucket>();

function getClientKey(request: Request): string {
  // Prefer standard forwarded-for header, fall back to a constant
  // for local dev. Vercel populates x-forwarded-for; in unit tests
  // there is no header, so we use a fixed key.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
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
    const key = getClientKey(request);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { tokens: max - 1, resetAt: now + windowMs });
      return handler(request, ...args);
    }

    if (bucket.tokens <= 0) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }

    bucket.tokens -= 1;
    return handler(request, ...args);
  };
}

/* ------------------------------------------------------------------ */
/* Input validation — Zod schema wrapper                               */
/* ------------------------------------------------------------------ */

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
/* Response helpers                                                    */
/* ------------------------------------------------------------------ */

/** Returns a 400 JSON response with a structured error. */
export function badRequest(message: string, issues?: string[]): NextResponse {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}
