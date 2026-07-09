import { describe, expect, it } from "vitest";
import {
  ArtifactSchema,
  AttackSchema,
  DefenseSchema,
  ProposalSchema,
  ScoreSchema,
} from "@/arena/schemas/types";
import { MOCK_DEFAULT_SEED, MockRuntime } from "@/lib/runtime/mock";
import { computeMockContentHash } from "@/lib/runtime/mock-content-hash";

const spec = { agentId: "team_safe_builder_v1" };

const proposalInput = {
  teamId: "team_safe_builder_v1",
  productName: "MockProduct",
  oneLiner: "A test product.",
  targetUser: "developers",
  problem: "Testing is slow.",
  solution: "Use mocks.",
  mvpFeatures: ["feature-a"],
  demoPlan: "Demo plan here.",
  technicalHighlight: "Tech highlight here.",
  risks: ["risk-a"],
  whyThisCanWin: "Speed.",
};

const attackInput = {
  id: "atk_001",
  attackerTeamId: "team_viral_designer_v1",
  targetTeamId: "team_safe_builder_v1",
  attackType: "too_generic" as const,
  claim: "Too generic.",
  evidence: "No differentiation.",
  severity: "medium" as const,
  suggestedFix: "Niche down.",
};

const defenseInput = {
  id: "def_001",
  attackId: "atk_001",
  teamId: "team_safe_builder_v1",
  targetTeamId: "team_viral_designer_v1",
  responseToAttack: "We are not generic.",
  acceptedAttack: false,
  revision: "Added more detail.",
};

const judgeInput = {
  teamId: "team_safe_builder_v1",
  scores: {
    novelty: 7,
    feasibility: 8,
    demoWow: 6,
    technicalDepth: 7,
    userValue: 8,
    longTermPotential: 7,
  },
  judgeComments: ["Good."],
};

const artifactInput = {
  id: "art_001",
  battleId: "btl_test01",
  type: "product_brief" as const,
  title: "Mock Brief",
  content: "Mock brief content.",
};

describe("MockRuntime", () => {
  it("runProposal returns Zod-valid output", async () => {
    const runtime = new MockRuntime();
    const output = await runtime.runProposal(spec, proposalInput);
    expect(() => ProposalSchema.parse(output)).not.toThrow();
  });

  it("runAttack returns Zod-valid output", async () => {
    const runtime = new MockRuntime();
    const output = await runtime.runAttack(spec, attackInput);
    expect(() => AttackSchema.parse(output)).not.toThrow();
  });

  it("runDefense returns Zod-valid output", async () => {
    const runtime = new MockRuntime();
    const output = await runtime.runDefense(spec, defenseInput);
    expect(() => DefenseSchema.parse(output)).not.toThrow();
  });

  it("runJudge returns Zod-valid output", async () => {
    const runtime = new MockRuntime();
    const output = await runtime.runJudge(spec, judgeInput);
    expect(() => ScoreSchema.parse(output)).not.toThrow();
  });

  it("runArtifact returns Zod-valid output", async () => {
    const runtime = new MockRuntime();
    const output = await runtime.runArtifact(spec, artifactInput);
    expect(() => ArtifactSchema.parse(output)).not.toThrow();
  });

  it("same seed produces same output (deterministic)", async () => {
    const r1 = new MockRuntime(MOCK_DEFAULT_SEED);
    const r2 = new MockRuntime(MOCK_DEFAULT_SEED);
    const a = await r1.runProposal(spec, proposalInput);
    const b = await r2.runProposal(spec, proposalInput);
    expect(a).toEqual(b);

    const atkA = await r1.runAttack(spec, attackInput);
    const atkB = await r2.runAttack(spec, attackInput);
    expect(atkA).toEqual(atkB);
  });

  it("different seeds produce different output", async () => {
    const r1 = new MockRuntime(1);
    const r2 = new MockRuntime(2);
    const a = await r1.runProposal(spec, proposalInput);
    const b = await r2.runProposal(spec, proposalInput);
    expect(a.productName).not.toEqual(b.productName);
  });

  it("content hash is stable across runs", async () => {
    const r1 = new MockRuntime(MOCK_DEFAULT_SEED);
    const outputs1 = [
      await r1.runProposal(spec, proposalInput),
      await r1.runAttack(spec, attackInput),
      await r1.runDefense(spec, defenseInput),
      await r1.runJudge(spec, judgeInput),
      await r1.runArtifact(spec, artifactInput),
    ];
    const hash1 = computeMockContentHash(outputs1);

    const r2 = new MockRuntime(MOCK_DEFAULT_SEED);
    const outputs2 = [
      await r2.runProposal(spec, proposalInput),
      await r2.runAttack(spec, attackInput),
      await r2.runDefense(spec, defenseInput),
      await r2.runJudge(spec, judgeInput),
      await r2.runArtifact(spec, artifactInput),
    ];
    const hash2 = computeMockContentHash(outputs2);

    expect(hash2).toEqual(hash1);
  });

  it("content hash format is sha256:<hex>", async () => {
    const runtime = new MockRuntime();
    const outputs = [await runtime.runProposal(spec, proposalInput)];
    const hash = computeMockContentHash(outputs);
    expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});