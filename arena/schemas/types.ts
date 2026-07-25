import { z } from "zod";

export const battleStatuses = [
  "idle",
  "briefing",
  "team_generation",
  "proposal_round",
  "cross_attack_round",
  "defense_round",
  "judging_round",
  "artifact_generation",
  "replay_generation",
  "completed",
  "failed",
  "retrying",
  "cancelled",
] as const;

export const battleTypes = ["hackathon", "startup", "research", "coding"] as const;
export const timeLimits = ["24h", "48h", "7d"] as const;
export const preferences = ["balanced", "viral", "technical", "safe"] as const;

export const artifactTypes = [
  "product_brief",
  "prd",
  "architecture",
  "demo_script",
  "pitch_outline",
  "todo",
] as const;

export const outputTargets = artifactTypes;

export const riskProfiles = ["safe", "balanced", "aggressive"] as const;

export const attackTypes = [
  "too_generic",
  "too_complex",
  "weak_demo",
  "weak_market",
  "weak_technical_depth",
  "no_viral_hook",
  "poor_feasibility",
  "unclear_user",
  "weak_long_term_vision",
] as const;

export const severities = ["low", "medium", "high", "fatal"] as const;

export const scoreCategories = [
  "novelty",
  "feasibility",
  "demoWow",
  "technicalDepth",
  "userValue",
  "longTermPotential",
] as const;

export const battleActorTypes = ["system", "team", "agent", "judge"] as const;

export const battleEventTypes = [
  "brief_created",
  "team_created",
  "proposal_created",
  "attack_created",
  "defense_created",
  "score_created",
  "champion_selected",
  "artifact_created",
  "replay_created",
  "passport_created",
  "commentary_created",
  "error",
] as const;

export type BattleStatus = (typeof battleStatuses)[number];
export type BattleType = (typeof battleTypes)[number];
export type TimeLimit = (typeof timeLimits)[number];
export type Preference = (typeof preferences)[number];
export type OutputTarget = (typeof outputTargets)[number];
export type RiskProfile = (typeof riskProfiles)[number];
export type AttackType = (typeof attackTypes)[number];
export type Severity = (typeof severities)[number];
export type ScoreCategory = (typeof scoreCategories)[number];
export type ArtifactType = (typeof artifactTypes)[number];
export type BattleActorType = (typeof battleActorTypes)[number];
export type BattleEventType = (typeof battleEventTypes)[number];

export type BattleSettings = {
  battleType: BattleType;
  timeLimit: TimeLimit;
  preference: Preference;
  outputTargets: OutputTarget[];
  mode?: string;
};

export const defaultBattleSettings: BattleSettings = {
  battleType: "hackathon",
  timeLimit: "48h",
  preference: "balanced",
  outputTargets: ["product_brief", "prd", "architecture", "demo_script", "pitch_outline", "todo"],
  mode: "full",
};

export type BattleBrief = {
  goal: string;
  constraints: string[];
  targetUser: string;
  successCriteria: string[];
  requiredArtifacts: string[];
};

export type Battle = {
  id: string;
  title: string;
  idea: string;
  type: BattleType;
  status: BattleStatus;
  constraints: {
    timeLimit: string;
    outputTargets: string[];
    preference?: string;
  };
  winnerTeamId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Team = {
  id: string;
  battleId: string;
  name: string;
  strategy: string;
  riskProfile: RiskProfile;
  eveAgentDirectory: string;
  score?: number;
};

export type EveAgentDefinition = {
  id: string;
  name: string;
  role: string;
  teamId?: string;
  directoryPath: string;
  instructionsPath: string;
  skills: string[];
  tools: string[];
  model?: string;
};

export type Proposal = {
  teamId: string;
  productName: string;
  oneLiner: string;
  targetUser: string;
  problem: string;
  solution: string;
  mvpFeatures: string[];
  demoPlan: string;
  technicalHighlight: string;
  risks: string[];
  whyThisCanWin: string;
};

export type Attack = {
  id: string;
  attackerTeamId: string;
  targetTeamId: string;
  attackType: AttackType;
  claim: string;
  evidence: string;
  severity: Severity;
  suggestedFix: string;
};

export type Defense = {
  id: string;
  attackId: string;
  teamId: string;
  targetTeamId: string;
  responseToAttack: string;
  acceptedAttack: boolean;
  revision: string;
};

export type ScoreBreakdown = Record<ScoreCategory, number>;

export type Score = {
  teamId: string;
  scores: ScoreBreakdown;
  judgeComments: string[];
  winningReason?: string;
  losingReason?: string;
};

export type CalculatedScore = Score & {
  totalScore: number;
};

export type Artifact = {
  id: string;
  battleId: string;
  type: ArtifactType;
  title: string;
  content: string;
};

export type PassportClaimEvidence = {
  claim: string;
  attackId: string;
  defenseId: string;
  acceptedAttack: boolean;
  attackerTeamId: string;
  defenderTeamId: string;
};

export type AgentPassport = {
  id: string;
  agentId: string;
  battleId: string;
  agentName: string;
  role: string;
  directoryPath: string;
  contributionSummary: string;
  acceptedClaims: PassportClaimEvidence[];
  rejectedClaims: PassportClaimEvidence[];
  strengths: string[];
  weaknesses: string[];
  contributionScore: number;
};

export type BattleEvent = {
  id: string;
  battleId: string;
  round: string;
  actorType: BattleActorType;
  actorId?: string;
  targetId?: string;
  eventType: BattleEventType;
  title: string;
  content: string;
  rawPayload?: unknown;
  createdAt: string;
};

export type CommentaryLine = {
  round: string;
  text: string;
};

export const CommentaryLineSchema = z.object({
  round: z.string().min(1),
  text: z.string().min(1),
});

export type BattleReplaySegment = {
  id: string;
  eventId: string;
  round: string;
  actorType: BattleActorType;
  actorId?: string;
  targetId?: string;
  title: string;
  body: string;
  createdAt: string;
};

export type BattleReplay = {
  id: string;
  battleId: string;
  title: string;
  summary: string;
  segments: BattleReplaySegment[];
  generatedFromEventIds: string[];
  createdAt: string;
};

export type CompletedBattleBundle = {
  battle: Battle;
  settings: BattleSettings;
  brief: BattleBrief;
  teams: Team[];
  agentDefinitions: EveAgentDefinition[];
  proposals: Proposal[];
  attacks: Attack[];
  defenses: Defense[];
  scores: CalculatedScore[];
  artifacts: Artifact[];
  replay: BattleReplay;
  passports: AgentPassport[];
  events: BattleEvent[];
  exportMarkdown: string;
};

export const ProposalSchema = z.object({
  teamId: z.string().min(1),
  productName: z.string().min(1),
  oneLiner: z.string().min(1),
  targetUser: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  mvpFeatures: z.array(z.string().min(1)),
  demoPlan: z.string().min(1),
  technicalHighlight: z.string().min(1),
  risks: z.array(z.string().min(1)),
  whyThisCanWin: z.string().min(1),
});

export const AttackSchema = z.object({
  id: z.string().min(1),
  attackerTeamId: z.string().min(1),
  targetTeamId: z.string().min(1),
  attackType: z.enum(attackTypes),
  claim: z.string().min(1),
  evidence: z.string().min(1),
  severity: z.enum(severities),
  suggestedFix: z.string().min(1),
});

export const DefenseSchema = z.object({
  id: z.string().min(1),
  attackId: z.string().min(1),
  teamId: z.string().min(1),
  targetTeamId: z.string().min(1),
  responseToAttack: z.string().min(1),
  acceptedAttack: z.boolean(),
  revision: z.string().min(1),
});

export const ScoreBreakdownSchema = z.object({
  novelty: z.number().min(0).max(10),
  feasibility: z.number().min(0).max(10),
  demoWow: z.number().min(0).max(10),
  technicalDepth: z.number().min(0).max(10),
  userValue: z.number().min(0).max(10),
  longTermPotential: z.number().min(0).max(10),
});

export const ScoreSchema = z.object({
  teamId: z.string().min(1),
  scores: ScoreBreakdownSchema,
  judgeComments: z.array(z.string().min(1)),
  winningReason: z.string().min(1).optional(),
  losingReason: z.string().min(1).optional(),
});

export const ArtifactSchema = z.object({
  id: z.string().min(1),
  battleId: z.string().min(1),
  type: z.enum(artifactTypes),
  title: z.string().min(1),
  content: z.string().min(1),
});
