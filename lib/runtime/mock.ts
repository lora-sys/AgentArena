import type {
  AgentSpec,
  ArenaAgentRuntime,
  ArtifactInput,
  ArtifactOutput,
  AttackInput,
  AttackOutput,
  DefenseInput,
  DefenseOutput,
  JudgeInput,
  JudgeOutput,
  ProposalInput,
  ProposalOutput,
} from "@/lib/runtime/contract";
import {
  ArtifactSchema,
  AttackSchema,
  DefenseSchema,
  ProposalSchema,
  ScoreSchema,
  artifactTypes,
  attackTypes,
  scoreCategories,
  severities,
} from "@/arena/schemas/types";

/**
 * Default seed used when none is provided. Fixed so tests are reproducible
 * across runs and machines.
 */
export const MOCK_DEFAULT_SEED = 0x4d6f636b; // "Mock" in ASCII

/**
 * Mulberry32 — small, fast, seedable PRNG. Sufficient for deterministic
 * mock output generation. Not cryptographic.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic, LLM-free implementation of ArenaAgentRuntime.
 *
 * Every method produces Zod-valid output derived from a seeded RNG.
 * Same seed → same output. Different seed → different output.
 *
 * Used by all unit and integration tests so the battle engine can run
 * end-to-end without calling any external model.
 */
export class MockRuntime implements ArenaAgentRuntime {
  private readonly seed: number;

  constructor(seed: number = MOCK_DEFAULT_SEED) {
    this.seed = seed >>> 0;
  }

  async runProposal(spec: AgentSpec, input: ProposalInput): Promise<ProposalOutput> {
    const rng = mulberry32(this.seed ^ hashStr(spec.agentId) ^ hashStr("proposal"));
    const output: ProposalOutput = {
      teamId: input.teamId,
      productName: pick(rng, ["Catalyst", "Forge", "Pulse", "Nimbus", "Beacon", "Sparrow", "Loom"]),
      oneLiner: `Deterministic mock proposal for ${input.teamId}.`,
      targetUser: input.targetUser || "mock-user",
      problem: input.problem || "mock-problem",
      solution: input.solution || "mock-solution",
      mvpFeatures: pickN(rng, ["auth", "dashboard", "api", "sse", "replay", "export", "scoring"], 3),
      demoPlan: "Walk through a 3-step demo flow with seeded data.",
      technicalHighlight: "Deterministic mock with seeded RNG, zero external calls.",
      risks: pickN(rng, ["scope-creep", "mock-drift", "schema-validity", "hash-stability"], 2),
      whyThisCanWin: "Reproducible, fast, and contract-compliant for test suites.",
    };
    return ProposalSchema.parse(output);
  }

  async runAttack(spec: AgentSpec, input: AttackInput): Promise<AttackOutput> {
    const rng = mulberry32(this.seed ^ hashStr(spec.agentId) ^ hashStr("attack") ^ hashStr(input.targetTeamId));
    const output: AttackOutput = {
      id: input.id,
      attackerTeamId: input.attackerTeamId,
      targetTeamId: input.targetTeamId,
      attackType: pick(rng, [...attackTypes]),
      claim: `Attack on ${input.targetTeamId} from mock attacker.`,
      evidence: "Deterministic evidence string produced by mock runtime.",
      severity: pick(rng, [...severities]),
      suggestedFix: "Add more detail and cite measurable metrics.",
    };
    return AttackSchema.parse(output);
  }

  async runDefense(spec: AgentSpec, input: DefenseInput): Promise<DefenseOutput> {
    const rng = mulberry32(this.seed ^ hashStr(spec.agentId) ^ hashStr("defense") ^ hashStr(input.attackId));
    const output: DefenseOutput = {
      id: input.id,
      attackId: input.attackId,
      teamId: input.teamId,
      targetTeamId: input.targetTeamId,
      responseToAttack: `Counter-argument from ${input.teamId} addressing the claim.`,
      acceptedAttack: rng() > 0.5,
      revision: "Revised proposal section to address the flagged weakness.",
    };
    return DefenseSchema.parse(output);
  }

  async runJudge(spec: AgentSpec, input: JudgeInput): Promise<JudgeOutput> {
    const rng = mulberry32(this.seed ^ hashStr(spec.agentId) ^ hashStr("judge") ^ hashStr(input.teamId));
    const scores: Record<string, number> = {};
    for (const cat of scoreCategories) {
      scores[cat] = Math.round(rng() * 10 * 100) / 100;
    }
    const output: JudgeOutput = {
      teamId: input.teamId,
      scores: {
        novelty: scores["novelty"]!,
        feasibility: scores["feasibility"]!,
        demoWow: scores["demoWow"]!,
        technicalDepth: scores["technicalDepth"]!,
        userValue: scores["userValue"]!,
        longTermPotential: scores["longTermPotential"]!,
      },
      judgeComments: ["Mock judge comment: solid structure.", "Mock judge comment: clear narrative."],
      winningReason: input.winningReason,
      losingReason: input.losingReason,
    };
    return ScoreSchema.parse(output);
  }

  async runArtifact(spec: AgentSpec, input: ArtifactInput): Promise<ArtifactOutput> {
    const rng = mulberry32(this.seed ^ hashStr(spec.agentId) ^ hashStr("artifact") ^ hashStr(input.type));
    const output: ArtifactOutput = {
      id: input.id,
      battleId: input.battleId,
      type: input.type || pick(rng, [...artifactTypes]),
      title: input.title || "Mock Artifact",
      content: input.content || "Deterministic mock artifact body generated from seeded RNG.",
    };
    return ArtifactSchema.parse(output);
  }
}

/**
 * Deterministic string → number hash. FNV-1a 32-bit.
 */
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function pickN<T>(rng: () => number, items: readonly T[], n: number): T[] {
  const copy = [...items];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}