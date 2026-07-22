export type TeamId =
  | "safe-builder"
  | "viral-designer"
  | "infra-hacker"
  | "judge-panel"
  | "artifact-writer";

export type BattleRound =
  | "briefing"
  | "proposal"
  | "cross_attack"
  | "defense"
  | "judging"
  | "champion"
  | "artifacts"
  | "passport";

export type Team = {
  id: TeamId;
  name: string;
  subtitle: string;
  strategy: string;
  color: "blue" | "purple" | "green" | "orange";
  score: number;
  avatar: string;
  skills: string[];
  spark: number[];
};

export type ScoreBreakdown = {
  novelty: number;
  feasibility: number;
  demoWow: number;
  technicalDepth: number;
  userValue: number;
  longTermPotential: number;
};

export type Attack = {
  from: TeamId;
  to: TeamId;
  severity: "High" | "Medium" | "Low";
  claim: string;
  evidence: string;
  acceptedByJudges: number;
  createdAt: string;
};

export type Artifact = {
  id: string;
  title: string;
  label: string;
  content: string;
};

export type PassportClaim = {
  claim: string;
  attackId: string;
  defenseId: string;
  acceptedAttack: boolean;
  attackerTeamId: TeamId;
  defenderTeamId: TeamId;
};

export type BattleEvent = {
  id: string;
  round: BattleRound;
  time: string;
  type: "Brief" | "Proposal" | "Attack" | "Defense" | "Score" | "Champion" | "Artifact" | "Passport";
  actor: string;
  target?: string;
  summary: string;
  impact?: "High" | "Medium" | "Low";
};

export type Passport = {
  teamId: TeamId;
  rating: number;
  globalRank: number;
  winRate: number;
  topThreeRate: number;
  contributionScore: number;
  consistency: number;
  acceptedClaims: PassportClaim[];
  rejectedClaims: PassportClaim[];
  strengths: string[];
  areasToImprove: string[];
};

export type Battle = {
  id: string;
  title: string;
  idea: string;
  status: "live" | "completed";
  currentRound: BattleRound;
  elapsed: string;
  duration: string;
  teams: Team[];
  winnerId?: TeamId;
  scores: Record<TeamId, ScoreBreakdown>;
  attacks: Attack[];
  events: BattleEvent[];
  artifacts: Artifact[];
  passport: Passport;
};
