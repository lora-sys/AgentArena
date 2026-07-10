import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  type RepairContext,
  repairWithRetry,
} from "./repair";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const testSchema = z.object({
  name: z.string().min(1),
  score: z.number().min(0).max(10),
  tags: z.array(z.string()),
});

const validValue = { name: "agent_a", score: 8, tags: ["fast", "cheap"] };

const baseContext: RepairContext = {
  battleId: "btl_test0001",
  round: "proposal_round",
  agentId: "team_safe_builder_v1",
  schemaName: "Proposal",
  instructions: "Generate a product proposal.",
  originalPrompt: "Generate a proposal for a privacy-first scheduler.",
};

/**
 * Build a mock `generate` function that returns a scripted sequence of
 * values. Each call pops the next value from the script.
 */
const scriptedGenerate = (script: unknown[]) => {
  let index = 0;
  return vi.fn(async (_prompt: string) => {
    const value = script[index] ?? script[script.length - 1];
    index += 1;
    return value;
  });
};

/**
 * Build a `generate` function that always throws.
 */
const throwingGenerate = (message: string) =>
  vi.fn(async (_prompt: string) => {
    throw new Error(message);
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("repairWithRetry", () => {
  it("returns ok: true on the first attempt when output is valid", async () => {
    const generate = scriptedGenerate([validValue]);

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(validValue);
      expect(result.attempts).toBe(1);
      expect(result.repairEvents).toHaveLength(3);
      // First event: schema_repair_started
      expect(result.repairEvents[0].eventType).toBe("schema_repair_started");
      // Second event: model_call_completed
      expect(result.repairEvents[1].eventType).toBe("model_call_completed");
      // Third event: schema_repair_completed
      expect(result.repairEvents[2].eventType).toBe("schema_repair_completed");
    }
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("returns ok: true after 1 retry when first attempt fails", async () => {
    // First call returns invalid (missing `tags`); second call returns valid.
    const generate = scriptedGenerate([
      { name: "agent_a", score: 8 }, // missing tags
      validValue,
    ]);

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(validValue);
      expect(result.attempts).toBe(2);
      // Events: repair_started, validation_failed, repair_started, model_call_completed, repair_completed = 5
      expect(result.repairEvents).toHaveLength(5);
      const types = result.repairEvents.map((e) => e.eventType);
      expect(types).toEqual([
        "schema_repair_started",
        "schema_validation_failed",
        "schema_repair_started",
        "model_call_completed",
        "schema_repair_completed",
      ]);
    }
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("returns ok: true after 3 retries (4th attempt succeeds)", async () => {
    // Three invalid responses, then a valid one. With maxRetries defaulting
    // to 3 we have 3 attempts total; we use maxRetries: 4 so the 4th attempt
    // is allowed.
    const generate = scriptedGenerate([
      { name: "agent_a", score: 8 }, // missing tags (attempt 1)
      { name: "", score: 8, tags: [] }, // empty name (attempt 2)
      { name: "agent_a", score: 99, tags: [] }, // score out of range (attempt 3)
      validValue, // valid (attempt 4)
    ]);

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
      maxRetries: 4,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(validValue);
      expect(result.attempts).toBe(4);
      // Events: 3x (started + validation_failed) + 1x (started + model_call_completed + repair_completed)
      // = 2 + 2 + 2 + 3 = 9
      expect(result.repairEvents).toHaveLength(9);
    }
    expect(generate).toHaveBeenCalledTimes(4);
  });

  it("returns ok: false after all retries are exhausted", async () => {
    // Every call returns an object that is missing the required `tags` field.
    const generate = scriptedGenerate([{ name: "agent_a", score: 8 }]);

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
      maxRetries: 3,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.attempts).toBe(3);
      expect(result.error).toContain("exhausted");
      expect(result.error).toContain("Proposal");
      expect(result.lastRawValue).toEqual({ name: "agent_a", score: 8 });
      // Events: 3x (started + validation_failed) = 6
      expect(result.repairEvents).toHaveLength(6);
    }
    expect(generate).toHaveBeenCalledTimes(3);
  });

  it("emits repair events in the correct order across attempts", async () => {
    const generate = scriptedGenerate([
      { name: "agent_a", score: 8 }, // attempt 1: invalid
      { name: "agent_b" }, // attempt 2: invalid (missing score + tags)
      validValue, // attempt 3: valid
    ]);

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const types = result.repairEvents.map((e) => e.eventType);
      expect(types).toEqual([
        "schema_repair_started", // attempt 1
        "schema_validation_failed", // attempt 1
        "schema_repair_started", // attempt 2
        "schema_validation_failed", // attempt 2
        "schema_repair_started", // attempt 3
        "model_call_completed", // attempt 3
        "schema_repair_completed", // attempt 3
      ]);

      // Verify attempt numbers are populated correctly.
      const attempts = result.repairEvents.map((e) => e.attempt);
      expect(attempts).toEqual([1, 1, 2, 2, 3, 3, 3]);
    }
  });

  it("appends a stricter prompt on each retry", async () => {
    const prompts: string[] = [];
    const generate = vi.fn(async (prompt: string) => {
      prompts.push(prompt);
      if (prompts.length === 1) {
        return { name: "agent_a", score: 8 }; // missing tags
      }
      if (prompts.length === 2) {
        return { name: "", score: 8, tags: [] }; // empty name
      }
      return validValue; // attempt 3: valid
    });

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
    });

    expect(result.ok).toBe(true);
    expect(prompts).toHaveLength(3);

    // First prompt is the original prompt unchanged.
    expect(prompts[0]).toBe(baseContext.originalPrompt);

    // Second prompt appends a REPAIR INSTRUCTIONS block referencing the
    // first failure.
    expect(prompts[1]).toContain("REPAIR INSTRUCTIONS");
    expect(prompts[1]).toContain("Proposal");
    expect(prompts[1]).toContain("tags");
    expect(prompts[1].length).toBeGreaterThan(prompts[0].length);

    // Third prompt also has a REPAIR INSTRUCTIONS block, but references
    // the second attempt's issues (name field), not the first.
    expect(prompts[2]).toContain("REPAIR INSTRUCTIONS");
    expect(prompts[2]).toContain("name");
    expect(prompts[2].length).toBeGreaterThan(prompts[1].length);
  });

  it("works with any z.ZodType, not just the test schema", async () => {
    const stringSchema = z.string().min(3);
    const generate = scriptedGenerate(["hello world"]);

    const result = await repairWithRetry({
      generate,
      schema: stringSchema,
      context: { ...baseContext, schemaName: "Label" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hello world");
      expect(typeof result.value).toBe("string");
    }
  });

  it("emits a model_call_failed event when generate throws and returns ok: false", async () => {
    const generate = throwingGenerate("upstream timeout");

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.attempts).toBe(1);
      expect(result.error).toContain("Model call failed");
      expect(result.error).toContain("upstream timeout");
      expect(result.lastRawValue).toBeUndefined();
      const types = result.repairEvents.map((e) => e.eventType);
      expect(types).toEqual([
        "schema_repair_started",
        "model_call_failed",
      ]);
    }
  });

  it("does not call generate more than maxRetries times on exhaustion", async () => {
    const generate = scriptedGenerate([{ name: "agent_a", score: 8 }]);

    await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
      maxRetries: 3,
    });

    expect(generate).toHaveBeenCalledTimes(3);
  });

  it("includes attempt and maxRetries metadata on every event", async () => {
    const generate = scriptedGenerate([validValue]);

    const result = await repairWithRetry({
      generate,
      schema: testSchema,
      context: baseContext,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      for (const event of result.repairEvents) {
        expect(event.attempt).toBeGreaterThanOrEqual(1);
        expect(event.maxRetries).toBe(3);
        expect(event.id).toBeTruthy();
        expect(event.createdAt).toBeTruthy();
      }
    }
  });
});
