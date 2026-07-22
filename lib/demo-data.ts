import { runDemoBattle } from "@/arena/engine/demo-battle";
import type { CompletedBattleBundle, ScoreCategory } from "@/arena/schemas";
import type {
  Artifact,
  Attack,
  Battle,
  BattleEvent,
  BattleRound,
  Passport,
  PassportClaim,
  ScoreBreakdown,
  Team,
  TeamId,
} from "./types";

export type ProposalView = {
  teamId: TeamId;
  productName: string;
  oneLiner: string;
  demoPlan: string;
  technicalHighlight: string;
  whyThisCanWin: string;
};

export type DefenseView = {
  id: string;
  attackId: string;
  teamId: TeamId;
  targetTeamId: TeamId;
  acceptedAttack: boolean;
  responseToAttack: string;
  revision: string;
};

/* ------------------------------------------------------------------ */
/* Lazy-loaded demo bundle — NOT executed at module import time.       */
/* All derived exports are functions that call getDemoBundle() on      */
/* first access. Server Components call these during render; the      */
/* computation happens server-side and the result is serialized.       */
/* ------------------------------------------------------------------ */

let _demoBundle: CompletedBattleBundle | null = null;

export function getDemoBundle(): CompletedBattleBundle {
  if (!_demoBundle) {
    _demoBundle = runDemoBattle({
      battleId: "battle-42",
      startAt: "2026-07-04T18:30:00.000Z",
    });
  }
  return _demoBundle;
}

export function resetDemoBundle(): void {
  _demoBundle = null;
}

const engineIdToUiId = {
  safe_builder: "safe-builder",
  viral_designer: "viral-designer",
  infra_hacker: "infra-hacker",
  judge_panel: "judge-panel",
  artifact_writer: "artifact-writer",
} as const satisfies Record<string, TeamId>;

const uiIdToEngineId = Object.fromEntries(
  Object.entries(engineIdToUiId).map(([engineId, uiId]) => [uiId, engineId]),
) as Record<TeamId, keyof typeof engineIdToUiId>;

const teamMeta: Record<TeamId, Pick<Team, "subtitle" | "color" | "avatar" | "skills">> = {
  "safe-builder": {
    subtitle: "Feasibility First",
    color: "blue",
    avatar: "SB",
    skills: ["System Design", "Risk Analysis", "Reliability"],
  },
  "viral-designer": {
    subtitle: "Make It Memorable",
    color: "purple",
    avatar: "VD",
    skills: ["UX Strategy", "Growth", "Engagement"],
  },
  "infra-hacker": {
    subtitle: "Tech Depth First",
    color: "green",
    avatar: "IH",
    skills: ["Infrastructure", "Performance", "Security"],
  },
  "judge-panel": {
    subtitle: "Rubric Judge",
    color: "orange",
    avatar: "JP",
    skills: ["Scoring", "Critique", "Rubrics"],
  },
  "artifact-writer": {
    subtitle: "Artifact Finisher",
    color: "orange",
    avatar: "AW",
    skills: ["Synthesis", "Markdown", "Packaging"],
  },
};

const scoreCategories: ScoreCategory[] = [
  "novelty",
  "feasibility",
  "demoWow",
  "technicalDepth",
  "userValue",
  "longTermPotential",
];

const artifactLabels: Record<Artifact["id"] | string, string> = {
  product_brief: "Product Brief",
  prd: "PRD",
  architecture: "Architecture",
  demo_script: "Demo Script",
  pitch_outline: "Pitch Outline",
  todo: "TODO",
};

const roundMap: Record<string, BattleRound> = {
  briefing: "briefing",
  team_generation: "proposal",
  proposal_round: "proposal",
  cross_attack_round: "cross_attack",
  defense_round: "defense",
  judging_round: "judging",
  artifact_generation: "artifacts",
  replay_generation: "passport",
  completed: "passport",
};

const eventTypeMap: Record<string, BattleEvent["type"]> = {
  brief_created: "Brief",
  team_created: "Proposal",
  proposal_created: "Proposal",
  attack_created: "Attack",
  defense_created: "Defense",
  score_created: "Score",
  champion_selected: "Champion",
  artifact_created: "Artifact",
  replay_created: "Champion",
  passport_created: "Passport",
};

const toUiTeamId = (engineId: string): TeamId => {
  const mapped = engineIdToUiId[engineId as keyof typeof engineIdToUiId];
  if (!mapped) {
    console.warn(`[demo-data] Unknown engine team ID: ${engineId}, falling back to safe-builder`);
    return "safe-builder";
  }
  return mapped;
};

const toEngineTeamId = (teamId: TeamId): keyof typeof engineIdToUiId => uiIdToEngineId[teamId];

const toPercent = (score: number): number => Math.round(score * 1000) / 100;

const makeSpark = (score: number): number[] => {
  const base = Math.max(40, Math.round(score) - 22);
  return [base, base + 3, base + 1, base + 8, base + 5, base + 10, base + 15, base + 18, base + 20, score - 2, score];
};

const formatEventTime = (createdAt: string): string =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(createdAt));

const makeTeams = (bundle: CompletedBattleBundle): Team[] =>
  bundle.teams.map((team) => {
    const id = toUiTeamId(team.id);
    const score = toPercent(team.score ?? 0);
    return {
      id,
      name: team.name,
      subtitle: teamMeta[id].subtitle,
      strategy: team.strategy,
      color: teamMeta[id].color,
      score,
      avatar: teamMeta[id].avatar,
      skills: teamMeta[id].skills,
      spark: makeSpark(score),
    };
  });

const makeScores = (bundle: CompletedBattleBundle): Record<TeamId, ScoreBreakdown> => {
  const scores: Record<string, ScoreBreakdown> = {};
  for (const score of bundle.scores) {
    const id = toUiTeamId(score.teamId);
    scores[id] = Object.fromEntries(
      scoreCategories.map((category) => [category, toPercent(score.scores[category])]),
    ) as ScoreBreakdown;
  }
  return scores as Record<TeamId, ScoreBreakdown>;
};

const makeAttacks = (bundle: CompletedBattleBundle): Attack[] =>
  bundle.attacks.map((attack, index) => ({
    from: toUiTeamId(attack.attackerTeamId),
    to: toUiTeamId(attack.targetTeamId),
    severity: attack.severity === "high" ? "High" : attack.severity === "medium" ? "Medium" : "Low",
    claim: attack.claim,
    evidence: attack.evidence,
    acceptedByJudges: bundle.defenses.find((defense) => defense.attackId === attack.id)?.acceptedAttack ? 3 : 1,
    createdAt: index === 0 ? "Just now" : `${index} min ago`,
  }));

const makeProposals = (bundle: CompletedBattleBundle): ProposalView[] =>
  bundle.proposals.map((proposal) => ({
    teamId: toUiTeamId(proposal.teamId),
    productName: proposal.productName,
    oneLiner: proposal.oneLiner,
    demoPlan: proposal.demoPlan,
    technicalHighlight: proposal.technicalHighlight,
    whyThisCanWin: proposal.whyThisCanWin,
  }));

const makeDefenses = (bundle: CompletedBattleBundle): DefenseView[] =>
  bundle.defenses.map((defense) => ({
    id: defense.id,
    attackId: defense.attackId,
    teamId: toUiTeamId(defense.teamId),
    targetTeamId: toUiTeamId(defense.targetTeamId),
    acceptedAttack: defense.acceptedAttack,
    responseToAttack: defense.responseToAttack,
    revision: defense.revision,
  }));

const makeEvents = (bundle: CompletedBattleBundle): BattleEvent[] =>
  bundle.events.map((event) => ({
    id: event.id,
    round: roundMap[event.round] ?? "briefing",
    time: formatEventTime(event.createdAt),
    type: eventTypeMap[event.eventType] ?? "Brief",
    actor: event.actorId ?? event.actorType,
    target: event.targetId,
    summary: event.title,
    impact: event.eventType === "attack_created" ? "High" : undefined,
  }));

const makeArtifacts = (bundle: CompletedBattleBundle): Artifact[] =>
  bundle.artifacts.map((artifact) => ({
    id: artifact.type,
    title: artifact.title,
    label: artifactLabels[artifact.type] ?? artifact.title,
    content: artifact.content,
  }));

const makeClaim = (claim: CompletedBattleBundle["passports"][number]["acceptedClaims"][number]): PassportClaim => ({
  claim: claim.claim,
  attackId: claim.attackId,
  defenseId: claim.defenseId,
  acceptedAttack: claim.acceptedAttack,
  attackerTeamId: toUiTeamId(claim.attackerTeamId),
  defenderTeamId: toUiTeamId(claim.defenderTeamId),
});

const makePassport = (bundle: CompletedBattleBundle, teamId: TeamId): Passport => {
  const engineTeamId = toEngineTeamId(teamId);
  const passport = bundle.passports.find((candidate) => candidate.agentId.startsWith(engineTeamId));
  const score = bundle.scores.find((candidate) => candidate.teamId === engineTeamId);

  // Rank this team against all teams by total score.
  const ranked = [...bundle.scores]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((s) => toUiTeamId(s.teamId));
  const globalRank = ranked.indexOf(teamId) + 1;

  return {
    teamId,
    rating: toPercent(score?.totalScore ?? 0),
    globalRank,
    winRate: globalRank === 1 ? 68.4 : 52.8,
    topThreeRate: 84.2,
    contributionScore: Math.round((score?.totalScore ?? 0) * 158),
    consistency: Math.round(((score?.totalScore ?? 0) + 1) * 10) / 10,
    acceptedClaims: passport?.acceptedClaims.map(makeClaim) ?? [],
    rejectedClaims: passport?.rejectedClaims.map(makeClaim) ?? [],
    strengths: passport?.strengths ?? [],
    areasToImprove: passport?.weaknesses ?? [],
  };
};

const buildDemoBattle = (bundle: CompletedBattleBundle): Battle => {
  const mappedTeams = makeTeams(bundle);
  const winnerId = toUiTeamId(bundle.battle.winnerTeamId ?? bundle.scores[0]?.teamId ?? "viral_designer");
  return {
    id: bundle.battle.id,
    title: "Battle #42",
    idea: bundle.battle.idea,
    status: "completed",
    currentRound: "cross_attack",
    elapsed: "00:18:42",
    duration: "00:48:36",
    teams: mappedTeams,
    winnerId,
    scores: makeScores(bundle),
    attacks: makeAttacks(bundle),
    events: makeEvents(bundle),
    artifacts: makeArtifacts(bundle),
    passport: makePassport(bundle, winnerId),
  };
};

/* ------------------------------------------------------------------ */
/* Derived exports — function getters (lazy, server-side only)         */
/* Server Components call these during render → computed server-side.  */
/* Client Components must fetch from API routes instead.               */
/* ------------------------------------------------------------------ */

let _cachedBattle: Battle | null = null;
let _cachedTeams: Team[] | null = null;
let _cachedWinner: Team | null = null;

export function getDemoBattle(): Battle {
  if (!_cachedBattle) {
    _cachedBattle = buildDemoBattle(getDemoBundle());
  }
  return _cachedBattle;
}

export function getTeams(): Team[] {
  if (!_cachedTeams) {
    _cachedTeams = getDemoBattle().teams;
  }
  return _cachedTeams;
}

export function getWinner(): Team {
  if (!_cachedWinner) {
    const battle = getDemoBattle();
    const bundle = getDemoBundle();
    // 1. Use the engine's declared winner if available.
    // 2. Fallback: sort by raw totalScore (not rounded percentage) to avoid
    //    tie-breaking by sort stability (insertion order).
    // 3. Final fallback: first team in the array.
    _cachedWinner = battle.teams.find((t) => t.id === battle.winnerId)
      ?? [...bundle.scores]
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((s) => toUiTeamId(s.teamId))
        .map((id) => battle.teams.find((t) => t.id === id))
        .find(Boolean)
      ?? battle.teams[0];
  }
  return _cachedWinner;
}

export function getProposals(): ProposalView[] {
  return makeProposals(getDemoBundle());
}

export function getDefenses(): DefenseView[] {
  return makeDefenses(getDemoBundle());
}

export function getTeam(id: TeamId) {
  return getTeams().find((team) => team.id === id);
}

export function formatScore(score: number) {
  return score.toFixed(1);
}

// Backward-compatible: these trigger computation but are cached.
// NOTE: Importing these directly from a Client Component will cause
// the bundle to be computed and serialized into the client JS.
// Client Components should call API routes instead.
export const demoBundle: CompletedBattleBundle = getDemoBundle();
export const demoBattle: Battle = getDemoBattle();
export const teams: Team[] = getTeams();
export const proposals: ProposalView[] = getProposals();
export const defenses: DefenseView[] = getDefenses();
export const winner: Team = getWinner();
