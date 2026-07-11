import { describe, expect, it, vi, beforeEach } from "vitest";
import { MastraRuntime } from "./mastra";
import type { AgentSpec } from "./contract";
import {
  ProposalSchema,
  AttackSchema,
  DefenseSchema,
  ScoreSchema,
  ArtifactSchema,
} from "@/arena/schemas/types";

type ChatChoice = { message: { content: string | null } };

function makeFakeClient(responses: Array<{ content: string } | Error | { status: number }>) {
  let callIndex = 0;
  const create = vi.fn(async (_args: { messages: Array<{ role: string; content: string }> }) => {
    const resp = responses[callIndex++];
    if (!resp) throw new Error("No more fake responses queued");
    if (resp instanceof Error) throw resp;
    if ("status" in resp) {
      // Simulate OpenAI SDK error with a .status property.
      const err = new Error(`OpenAI API error: HTTP ${resp.status}`);
      (err as Error & { status: number }).status = resp.status;
      throw err;
    }
    return {
      choices: [{ message: { content: resp.content } } satisfies ChatChoice],
    };
  });
  return { chat: { completions: { create } } };
}

const sampleSpec: AgentSpec = {
  agentId: "agent_safe_builder_v1",
  teamId: "team_safe_builder",
  model: "openai/gpt-5",
  maxRetries: 3,
};

const validProposal = {
  teamId: "team_safe_builder",
  productName: "SafePost",
  oneLiner: "Privacy-first scheduling",
  targetUser: "Remote engineering managers",
  problem: "Schedulers leak calendar data",
  solution: "E2E encrypted scheduling",
  mvpFeatures: ["E2E encryption", "Timezone intel"],
  demoPlan: "Create meeting, verify privacy",
  technicalHighlight: "Zero-knowledge proofs",
  risks: ["Key management UX"],
  whyThisCanWin: "Only scheduler with verifiable privacy",
};

const validAttack = {
  id: "atk_001",
  attackerTeamId: "team_viral_designer",
  targetTeamId: "team_safe_builder",
  attackType: "too_complex" as const,
  claim: "ZK is overkill",
  evidence: "Users want convenience",
  severity: "medium" as const,
  suggestedFix: "Use TLS instead",
};

const validDefense = {
  id: "def_001",
  attackId: "atk_001",
  teamId: "team_safe_builder",
  targetTeamId: "team_viral_designer",
  responseToAttack: "Privacy is a moat",
  acceptedAttack: false,
  revision: "Keep ZK, add simple TLS mode",
};

const validJudge = {
  teamId: "team_safe_builder",
  scores: {
    novelty: 8,
    feasibility: 7,
    demoWow: 6,
    technicalDepth: 9,
    userValue: 7,
    longTermPotential: 8,
  },
  judgeComments: ["Strong tech"],
  winningReason: "Best depth",
};

const validArtifact = {
  id: "art_001",
  battleId: "btl_abc12345",
  type: "product_brief" as const,
  title: "SafePost Brief",
  content: "# SafePost\nPrivacy-first...",
};

describe("MastraRuntime", () => {
  let events: Array<{ type: string; method: string; attempt: number }>;

  beforeEach(() => {
    events = [];
  });

  function makeRuntime(client: ReturnType<typeof makeFakeClient>) {
    const onEvent = vi.fn((e: { type: string; method: string; attempt: number }) => {
      events.push(e);
    });
    return new MastraRuntime({ client: client as never, onEvent });
  }

  it("runProposal calls OpenAI and validates output via Zod", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validProposal) }]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runProposal(sampleSpec, validProposal);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result.productName).toBe("SafePost");
    ProposalSchema.parse(result);
  });

  it("runAttack calls OpenAI and validates output via Zod", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validAttack) }]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runAttack(sampleSpec, validAttack);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result.attackType).toBe("too_complex");
    AttackSchema.parse(result);
  });

  it("runDefense calls OpenAI and validates output via Zod", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validDefense) }]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runDefense(sampleSpec, validDefense);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result.acceptedAttack).toBe(false);
    DefenseSchema.parse(result);
  });

  it("runJudge calls OpenAI and validates output via Zod", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validJudge) }]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runJudge(sampleSpec, validJudge);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result.scores.technicalDepth).toBe(9);
    ScoreSchema.parse(result);
  });

  it("runArtifact calls OpenAI and validates output via Zod", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validArtifact) }]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runArtifact(sampleSpec, validArtifact);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result.type).toBe("product_brief");
    ArtifactSchema.parse(result);
  });

  it("repair loop retries on invalid output and emits schema_repair_started", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(validProposal) },
    ]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runProposal(sampleSpec, validProposal);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledTimes(2);
    expect(result.productName).toBe("SafePost");
    const started = events.filter((e) => e.type === "schema_repair_started");
    expect(started).toHaveLength(1);
    expect(started[0].method).toBe("runProposal");
    expect(started[0].attempt).toBe(1);
  });

  it("repair loop emits schema_repair_completed when retry succeeds", async () => {
    const invalid = { ...validProposal, mvpFeatures: [""] as string[] };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(validProposal) },
    ]);
    const runtime = makeRuntime(fakeClient);

    await runtime.runProposal(sampleSpec, validProposal);

    const completed = events.filter((e) => e.type === "schema_repair_completed");
    expect(completed).toHaveLength(1);
    expect(completed[0].method).toBe("runProposal");
  });

  it("schema_repair_completed does NOT fire on first-attempt success (critical fix)", async () => {
    // Critical fix: `if (attempt > 0)` was always true for attempt=1,
    // making the event semantically meaningless. After fix, the event
    // should only fire when a repair actually occurred (attempt > 1).
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validProposal) }]);
    const runtime = makeRuntime(fakeClient);

    await runtime.runProposal(sampleSpec, validProposal);

    const completed = events.filter((e) => e.type === "schema_repair_completed");
    expect(completed).toHaveLength(0);
  });

  it("repair loop retries up to maxRetries total attempts then THROWS instead of fabricating mock output (R21)", async () => {
    // R21 fix: model-output errors must NOT be silently masked by mock fallback.
    // Throwing preserves the real failure so callers can handle it.
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow();
    expect(fakeClient.chat.completions.create).toHaveBeenCalledTimes(3);
  });

  it("repair loop with budget=3 emits 2 schema_repair_started events when all fail", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    try {
      await runtime.runProposal(sampleSpec, validProposal);
    } catch {
      // expected
    }

    const started = events.filter((e) => e.type === "schema_repair_started");
    expect(started).toHaveLength(2);
    expect(started[0].attempt).toBe(1);
    expect(started[1].attempt).toBe(2);
  });

  it("SchemaRepairExhaustedError propagates from runWithFallback without any mock fallback (R21)", async () => {
    // R21 fix: SchemaRepairExhaustedError is a model-output error and must
    // be thrown, not masked by mock. The repair loop already emits
    // battle_failed, so the caller sees exactly one battle_failed event.
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow();

    const failed = events.filter((e) => e.type === "battle_failed");
    // Exactly one battle_failed: from the repair loop, not duplicated by fallback.
    expect(failed).toHaveLength(1);
    expect(failed[0].attempt).toBe(3); // repair loop emits with attempt = retryBudget
  });

  it("exhausted repair emits low_confidence_judging event", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    try {
      await runtime.runProposal(sampleSpec, validProposal);
    } catch {
      // expected
    }

    const lc = events.filter((e) => e.type === "low_confidence_judging");
    expect(lc).toHaveLength(1);
    expect(lc[0].method).toBe("runProposal");
  });

  it("exhausted repair emits exactly one battle_failed event (no fallback battle_failed, R21)", async () => {
    // R21 fix: SchemaRepairExhaustedError is thrown, not swallowed by mock.
    // The repair loop emits exactly one battle_failed — the fallback handler
    // must NOT add a duplicate for a model-output error.
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow();

    const failed = events.filter((e) => e.type === "battle_failed");
    expect(failed).toHaveLength(1);
    expect(failed[0].method).toBe("runProposal");
  });

  it("battle_failed event fires after low_confidence_judging in event order", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    try {
      await runtime.runProposal(sampleSpec, validProposal);
    } catch {
      // expected
    }

    const lcIndex = events.findIndex((e) => e.type === "low_confidence_judging");
    const failedIndex = events.findIndex((e) => e.type === "battle_failed");
    expect(lcIndex).toBeGreaterThanOrEqual(0);
    expect(failedIndex).toBeGreaterThanOrEqual(0);
    expect(failedIndex).toBeGreaterThan(lcIndex);
  });

  it("repair prompt is stricter on retry (includes repair suffix)", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(validProposal) },
    ]);
    const runtime = makeRuntime(fakeClient);

    await runtime.runProposal(sampleSpec, validProposal);

    const calls = fakeClient.chat.completions.create.mock.calls;
    expect(calls).toHaveLength(2);
    const firstArgs = calls[0]![0];
    const secondArgs = calls[1]![0];
    const firstSystem = firstArgs.messages[0]!.content;
    const secondSystem = secondArgs.messages[0]!.content;
    expect(firstSystem).not.toContain("previous response failed validation");
    expect(secondSystem).toContain("previous response failed validation");
  });

  it("runAttack accepts AttackInput parameter (not AttackOutput)", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validAttack) }]);
    const runtime = makeRuntime(fakeClient);

    // This should compile and run without type errors.
    // If runAttack incorrectly typed its param as AttackOutput,
    // passing validAttack (which is AttackInput) would fail at compile time
    // once the types diverge. For now both are equal so we verify runtime
    // behavior: the second arg is consumed correctly as input data.
    const result = await runtime.runAttack(sampleSpec, validAttack);
    expect(result.id).toBe("atk_001");
    expect(result.attackerTeamId).toBe("team_viral_designer");
    AttackSchema.parse(result);
  });

  it("tryParseJson recovers JSON wrapped in markdown fences", async () => {
    const fakeClient = makeFakeClient([
      { content: "```json\n" + JSON.stringify(validProposal) + "\n```" },
    ]);
    const runtime = makeRuntime(fakeClient);

    const result = await runtime.runProposal(sampleSpec, validProposal);
    expect(result.productName).toBe("SafePost");
  });

  it("tryParseJson THROWS on completely invalid output instead of fabricating mock (R21)", async () => {
    // R21 fix: bad JSON from the model is a model-output error.
    // It must throw so callers see the real failure, not silently
    // receive fabricated mock output.
    const fakeClient = makeFakeClient([{ content: "this is not json at all" }]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow();
  });

  it("re-throws 401 infrastructure errors instead of silently falling back to mock", async () => {
    // Critical fix: 401 (unauthorized) must not be masked as mock output.
    // Before fix, any error from OpenAI → fallback to mock → caller never
    // knows the API key is invalid.
    const fakeClient = makeFakeClient([{ status: 401 }]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow();
    // Should NOT have called the mock fallback — the error must propagate.
    const fallbackEvents = events.filter((e) => e.type === "battle_failed" && e.attempt === 0);
    expect(fallbackEvents).toHaveLength(0);
  });

  it("re-throws 429 rate-limit errors instead of silently falling back to mock", async () => {
    // Critical fix: 429 (rate limited) must propagate so callers can retry.
    const fakeClient = makeFakeClient([{ status: 429 }]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow();
  });

  it("re-throws AbortError without falling back to mock", async () => {
    // AbortError: user cancelled — propagation is correct, mock fallback is NOT.
    const abortErr = new Error("Request was aborted");
    abortErr.name = "AbortError";
    const fakeClient = makeFakeClient([abortErr]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow("aborted");
  });

  it("re-throws empty-content error without falling back to mock (R23)", async () => {
    // R23 fix: "OpenAI returned empty content" is a model-output error.
    // It must throw so callers see the real failure, not silently
    // receive fabricated mock output.
    const fakeClient = makeFakeClient([
      { choices: [{ message: { content: null } }] } as never,
    ]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow(
      /returned empty content/i,
    );
  });

  it("passes maxRetries: 0 to chat.completions.create so repair loop counts match actual API calls (BE-2)", async () => {
    const fakeClient = makeFakeClient([{ content: JSON.stringify(validProposal) }]);
    const runtime = new MastraRuntime({ client: fakeClient as unknown as never });

    await runtime.runProposal(sampleSpec, validProposal);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ maxRetries: 0 }),
    );
  });
});
