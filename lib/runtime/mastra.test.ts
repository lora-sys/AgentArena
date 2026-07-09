import { describe, expect, it, vi, beforeEach } from "vitest";
import { MastraRuntime, SchemaRepairExhaustedError } from "./mastra";
import type { AgentSpec } from "./contract";
import {
  ProposalSchema,
  AttackSchema,
  DefenseSchema,
  ScoreSchema,
  ArtifactSchema,
} from "@/arena/schemas/types";

type ChatChoice = { message: { content: string | null } };

function makeFakeClient(responses: Array<{ content: string } | Error>) {
  let callIndex = 0;
  const create = vi.fn(async (_args: { messages: Array<{ role: string; content: string }> }) => {
    const resp = responses[callIndex++];
    if (!resp) throw new Error("No more fake responses queued");
    if (resp instanceof Error) throw resp;
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
    expect(started[0].attempt).toBe(0);
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

  it("repair loop retries up to 3 times then throws SchemaRepairExhaustedError", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
      { content: JSON.stringify(invalid) },
    ]);
    const runtime = makeRuntime(fakeClient);

    await expect(runtime.runProposal(sampleSpec, validProposal)).rejects.toThrow(
      SchemaRepairExhaustedError,
    );
    expect(fakeClient.chat.completions.create).toHaveBeenCalledTimes(4);
  });

  it("exhausted repair emits low_confidence_judging event", async () => {
    const invalid = { ...validProposal, productName: "" };
    const fakeClient = makeFakeClient([
      { content: JSON.stringify(invalid) },
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
});
