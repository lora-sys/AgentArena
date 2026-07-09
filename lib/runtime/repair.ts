import type { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The set of structured event names that the repair loop can emit.
 * These align with PRD §13.4 (schema_repair_started, model_call_completed,
 * model_call_failed, schema_validation_failed, schema_repair_completed).
 */
export type RepairEventType =
  | "schema_repair_started"
  | "schema_repair_completed"
  | "model_call_completed"
  | "model_call_failed"
  | "schema_validation_failed";

/**
 * A single structured event produced by the repair loop.
 * The shape mirrors the project's BattleEvent so callers can persist
 * the returned events directly into the event store.
 */
export type RepairEvent = {
  id: string;
  eventType: RepairEventType;
  attempt: number;
  maxRetries: number;
  title: string;
  content: string;
  rawPayload?: unknown;
  createdAt: string;
};

/**
 * Contextual information passed into every repair attempt. Used to build
 * the prompt that is sent to the generate function on each retry.
 */
export type RepairContext = {
  battleId: string;
  round: string;
  agentId: string;
  schemaName: string;
  /** Human-readable instructions for the model. */
  instructions: string;
  /** The original prompt or input payload. */
  originalPrompt: string;
};

/**
 * Options accepted by repairWithRetry.
 *
 * - `generate`: produces an unknown value given a prompt string
 * - `schema`: Zod schema used to validate the generated value
 * - `context`: contextual data used to build the prompt on each attempt
 * - `maxRetries`: total number of attempts (default 3)
 * - `now`: optional clock injection for deterministic tests
 * - `idGenerator`: optional id generator for deterministic tests
 */
export type RepairOptions<T> = {
  generate: (prompt: string) => Promise<unknown>;
  schema: z.ZodType<T>;
  context: RepairContext;
  maxRetries?: number;
  now?: () => Date;
  idGenerator?: () => string;
};

/**
 * Result returned by repairWithRetry.
 *
 * On success: { ok: true, value, attempts, repairEvents }
 * On failure: { ok: false, error, attempts, lastRawValue, repairEvents }
 */
export type RepairResult<T> =
  | {
      ok: true;
      value: T;
      attempts: number;
      repairEvents: RepairEvent[];
    }
  | {
      ok: false;
      error: string;
      attempts: number;
      lastRawValue: unknown;
      repairEvents: RepairEvent[];
    };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultMaxRetries = 3;

const defaultNow = (): Date => new Date();

const defaultIdGenerator = (): string => {
  // Simple monotonic id; sufficient for structured event ids in a single run.
  return `rep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Build the prompt that will be sent to the model for a given attempt.
 * On the first attempt the prompt is the original prompt.
 * On retries the prompt is augmented with a stricter instruction
 * that asks the model to fix the Zod validation issues.
 */
const buildPrompt = (
  context: RepairContext,
  attempt: number,
  previousIssues: string | null,
): string => {
  if (attempt === 1 || previousIssues === null) {
    return context.originalPrompt;
  }

  return [
    context.originalPrompt,
    "",
    "--- REPAIR INSTRUCTIONS ---",
    `Your previous output did not match the expected ${context.schemaName} schema.`,
    "Fix the following issues and respond again with a complete, valid object:",
    previousIssues,
    "",
    "Constraints:",
    "- Return ONLY a valid JSON object that matches the schema.",
    "- Do not include any commentary, markdown fences, or explanation outside the JSON.",
    "- Every required field must be present and of the correct type.",
  ].join("\n");
};

/**
 * Format Zod issues into a human-readable string for the repair prompt.
 */
const formatZodIssues = (issues: z.ZodIssue[]): string =>
  issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Attempt to generate a value from the model and validate it against a Zod
 * schema. On validation failure, retry up to `maxRetries` times with a
 * progressively stricter prompt. Every attempt produces a structured event
 * that the caller can persist into the event store.
 *
 * The function is pure: it does not perform any I/O beyond calling the
 * provided `generate` function, and it does not emit events to any global
 * sink. All events are returned as data on the RepairResult.
 */
export async function repairWithRetry<T>(
  options: RepairOptions<T>,
): Promise<RepairResult<T>> {
  const {
    generate,
    schema,
    context,
    maxRetries = defaultMaxRetries,
    now = defaultNow,
    idGenerator = defaultIdGenerator,
  } = options;

  if (maxRetries < 1) {
    return {
      ok: false,
      error: `maxRetries must be >= 1, got ${maxRetries}`,
      attempts: 0,
      lastRawValue: undefined,
      repairEvents: [],
    };
  }

  const events: RepairEvent[] = [];
  let lastRawValue: unknown = undefined;
  let previousIssues: string | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Emit a schema_repair_started event for every attempt so the
    // event store can show the full repair trail.
    events.push({
      id: idGenerator(),
      eventType: "schema_repair_started",
      attempt,
      maxRetries,
      title: `Repair attempt ${attempt}/${maxRetries} for ${context.schemaName}`,
      content: `Agent ${context.agentId} in round ${context.round} of battle ${context.battleId}: schema_repair_started`,
      createdAt: now().toISOString(),
    });

    const prompt = buildPrompt(context, attempt, previousIssues);
    let rawValue: unknown;
    try {
      rawValue = await generate(prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      events.push({
        id: idGenerator(),
        eventType: "model_call_failed",
        attempt,
        maxRetries,
        title: `Model call failed on attempt ${attempt}`,
        content: `Agent ${context.agentId} in round ${context.round}: model_call_failed — ${message}`,
        rawPayload: { error: message },
        createdAt: now().toISOString(),
      });
      // Surface the last error to the caller. We do not retry after a
      // thrown model call because the failure is usually infrastructure-
      // level; the caller can decide to re-run repairWithRetry if desired.
      return {
        ok: false,
        error: `Model call failed on attempt ${attempt}: ${message}`,
        attempts: attempt,
        lastRawValue: undefined,
        repairEvents: events,
      };
    }

    lastRawValue = rawValue;

    const parseResult = schema.safeParse(rawValue);
    if (parseResult.success) {
      events.push({
        id: idGenerator(),
        eventType: "model_call_completed",
        attempt,
        maxRetries,
        title: `Model call completed on attempt ${attempt}`,
        content: `Agent ${context.agentId} produced valid ${context.schemaName} output on attempt ${attempt}`,
        rawPayload: rawValue,
        createdAt: now().toISOString(),
      });
      events.push({
        id: idGenerator(),
        eventType: "schema_repair_completed",
        attempt,
        maxRetries,
        title: `Schema repair completed on attempt ${attempt}`,
        content: `Agent ${context.agentId} in round ${context.round} of battle ${context.battleId}: schema_repair_completed`,
        createdAt: now().toISOString(),
      });
      return {
        ok: true,
        value: parseResult.data,
        attempts: attempt,
        repairEvents: events,
      };
    }

    // Validation failed — record the failure and prepare a stricter prompt
    // for the next attempt.
    const issuesText = formatZodIssues(parseResult.error.issues);
    previousIssues = issuesText;

    events.push({
      id: idGenerator(),
      eventType: "schema_validation_failed",
      attempt,
      maxRetries,
      title: `Schema validation failed on attempt ${attempt}`,
      content: `Agent ${context.agentId} in round ${context.round}: schema_validation_failed — ${parseResult.error.issues.length} issue(s)`,
      rawPayload: { issues: parseResult.error.issues, rawValue },
      createdAt: now().toISOString(),
    });
  }

  return {
    ok: false,
    error: `Schema repair exhausted ${maxRetries} attempts for ${context.schemaName}`,
    attempts: maxRetries,
    lastRawValue,
    repairEvents: events,
  };
}
