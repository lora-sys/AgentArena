import type { z } from "zod";
import type {
  ArtifactSchema,
  AttackSchema,
  DefenseSchema,
  ProposalSchema,
  ScoreSchema,
} from "@/arena/schemas/types";

export type ProposalInput = z.infer<typeof ProposalSchema>;
export type ProposalOutput = ProposalInput;

export type AttackInput = z.infer<typeof AttackSchema>;
export type AttackOutput = AttackInput;

export type DefenseInput = z.infer<typeof DefenseSchema>;
export type DefenseOutput = DefenseInput;

export type JudgeInput = z.infer<typeof ScoreSchema>;
export type JudgeOutput = JudgeInput;

export type ArtifactInput = z.infer<typeof ArtifactSchema>;
export type ArtifactOutput = ArtifactInput;

export type AgentRole =
  | "contestant"
  | "judge"
  | "artifact_writer"
  | "commentator";

export type AgentSpec = {
  agentId: string;
  role?: AgentRole;
  teamId?: string;
  model?: string;
  maxRetries?: number;
};

export interface ArenaAgentRuntime {
  runProposal(spec: AgentSpec, input: ProposalInput): Promise<ProposalOutput>;
  runAttack(spec: AgentSpec, input: AttackInput): Promise<AttackOutput>;
  runDefense(spec: AgentSpec, input: DefenseInput): Promise<DefenseOutput>;
  runJudge(spec: AgentSpec, input: JudgeInput): Promise<JudgeOutput>;
  runArtifact(spec: AgentSpec, input: ArtifactInput): Promise<ArtifactOutput>;
}
