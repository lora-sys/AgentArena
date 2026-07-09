import { describe, expect, it } from "vitest";
import {
  type ArenaAgentRuntime,
  type AgentSpec,
  type ProposalInput,
  type AttackInput,
  type DefenseInput,
  type JudgeInput,
  type ArtifactInput,
  type ProposalOutput,
  type AttackOutput,
  type DefenseOutput,
  type JudgeOutput,
  type ArtifactOutput,
} from "./contract";

const sampleSpec: AgentSpec = {
  agentId: "agent_safe_builder_v1",
  teamId: "team_safe_builder",
  model: "openai/gpt-5",
  maxRetries: 3,
};

const sampleProposalInput: ProposalInput = {
  teamId: "team_safe_builder",
  productName: "SafePost",
  oneLiner: "Privacy-first scheduling for distributed teams",
  targetUser: "Remote-first engineering managers",
  problem: "Existing schedulers leak calendar data to third parties",
  solution: "End-to-end encrypted scheduling with zero-knowledge architecture",
  mvpFeatures: ["E2E encryption", "Timezone intelligence", "Slack integration"],
  demoPlan: "Live demo: create meeting, invite guest, verify zero data leakage",
  technicalHighlight: "Zero-knowledge proofs for availability without revealing calendar",
  risks: ["Key management UX", "Slack API rate limits"],
  whyThisCanWin: "Only scheduler with verifiable privacy guarantees",
};

const sampleAttackInput: AttackInput = {
  id: "atk_001",
  attackerTeamId: "team_viral_designer",
  targetTeamId: "team_safe_builder",
  attackType: "too_complex",
  claim: "Zero-knowledge architecture is overkill for scheduling",
  evidence: "Users care about convenience, not cryptographic guarantees",
  severity: "medium",
  suggestedFix: "Use standard TLS instead of ZK proofs",
};

const sampleDefenseInput: DefenseInput = {
  id: "def_001",
  attackId: "atk_001",
  teamId: "team_safe_builder",
  targetTeamId: "team_viral_designer",
  responseToAttack: "Privacy is a competitive moat in the EU market",
  acceptedAttack: false,
  revision: "Keep ZK proofs; add simpler TLS mode for non-sensitive meetings",
};

const sampleJudgeInput: JudgeInput = {
  teamId: "team_safe_builder",
  scores: {
    novelty: 8,
    feasibility: 7,
    demoWow: 6,
    technicalDepth: 9,
    userValue: 7,
    longTermPotential: 8,
  },
  judgeComments: ["Strong technical differentiation", "Demo could be more visceral"],
  winningReason: "Best technical depth",
};

const sampleArtifactInput: ArtifactInput = {
  id: "art_001",
  battleId: "btl_abc12345",
  type: "product_brief",
  title: "SafePost Product Brief",
  content: "# SafePost\n\nPrivacy-first scheduling...",
};

describe("ArenaAgentRuntime contract", () => {
  it("interface compiles", () => {
    const stub: ArenaAgentRuntime = {
      async runProposal(_spec, _input) {
        return sampleProposalInput;
      },
      async runAttack(_spec, _input) {
        return sampleAttackInput;
      },
      async runDefense(_spec, _input) {
        return sampleDefenseInput;
      },
      async runJudge(_spec, _input) {
        return sampleJudgeInput;
      },
      async runArtifact(_spec, _input) {
        return sampleArtifactInput;
      },
    };
    expect(stub).toBeDefined();
  });

  it("runProposal signature accepts ProposalInput and returns ProposalOutput", async () => {
    const fn = async (_spec: AgentSpec, _input: ProposalInput): Promise<ProposalOutput> => sampleProposalInput;
    const result = await fn(sampleSpec, sampleProposalInput);
    expect(result.teamId).toBe("team_safe_builder");
    expect(result.mvpFeatures).toHaveLength(3);
  });

  it("runAttack signature accepts AttackInput and returns AttackOutput", async () => {
    const fn = async (_spec: AgentSpec, _input: AttackInput): Promise<AttackOutput> => sampleAttackInput;
    const result = await fn(sampleSpec, sampleAttackInput);
    expect(result.attackType).toBe("too_complex");
    expect(result.severity).toBe("medium");
  });

  it("runDefense signature accepts DefenseInput and returns DefenseOutput", async () => {
    const fn = async (_spec: AgentSpec, _input: DefenseInput): Promise<DefenseOutput> => sampleDefenseInput;
    const result = await fn(sampleSpec, sampleDefenseInput);
    expect(result.acceptedAttack).toBe(false);
    expect(result.attackId).toBe("atk_001");
  });

  it("runJudge signature accepts JudgeInput and returns JudgeOutput", async () => {
    const fn = async (_spec: AgentSpec, _input: JudgeInput): Promise<JudgeOutput> => sampleJudgeInput;
    const result = await fn(sampleSpec, sampleJudgeInput);
    expect(result.scores.technicalDepth).toBe(9);
    expect(result.judgeComments).toHaveLength(2);
  });

  it("runArtifact signature accepts ArtifactInput and returns ArtifactOutput", async () => {
    const fn = async (_spec: AgentSpec, _input: ArtifactInput): Promise<ArtifactOutput> => sampleArtifactInput;
    const result = await fn(sampleSpec, sampleArtifactInput);
    expect(result.type).toBe("product_brief");
    expect(result.title).toBe("SafePost Product Brief");
  });

  it("round-trips ProposalInput through type check", () => {
    const input: ProposalInput = sampleProposalInput;
    const output: ProposalOutput = input;
    expect(output).toEqual(input);
  });

  it("round-trips AttackInput through type check", () => {
    const input: AttackInput = sampleAttackInput;
    const output: AttackOutput = input;
    expect(output).toEqual(input);
  });

  it("round-trips DefenseInput through type check", () => {
    const input: DefenseInput = sampleDefenseInput;
    const output: DefenseOutput = input;
    expect(output).toEqual(input);
  });

  it("round-trips JudgeInput through type check", () => {
    const input: JudgeInput = sampleJudgeInput;
    const output: JudgeOutput = input;
    expect(output).toEqual(input);
  });

  it("round-trips ArtifactInput through type check", () => {
    const input: ArtifactInput = sampleArtifactInput;
    const output: ArtifactOutput = input;
    expect(output).toEqual(input);
  });

  it("AgentSpec has required agentId and optional fields", () => {
    const minimal: AgentSpec = { agentId: "agent_minimal" };
    expect(minimal.agentId).toBe("agent_minimal");
    expect(minimal.teamId).toBeUndefined();
    expect(minimal.model).toBeUndefined();
  });
});
