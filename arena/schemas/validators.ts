import {
  artifactTypes,
  attackTypes,
  battleActorTypes,
  battleEventTypes,
  battleStatuses,
  battleTypes,
  riskProfiles,
  scoreCategories,
  severities,
  type AgentPassport,
  type Artifact,
  type Attack,
  type Battle,
  type BattleBrief,
  type BattleEvent,
  type Defense,
  type PassportClaimEvidence,
  type Proposal,
  type Score,
  type ScoreBreakdown,
  type Team,
} from "./types";

export class SchemaValidationError extends Error {
  readonly issues: string[];

  constructor(schemaName: string, issues: string[]) {
    super(`${schemaName} validation failed: ${issues.join("; ")}`);
    this.name = "SchemaValidationError";
    this.issues = issues;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isOneOf = <T extends readonly string[]>(value: unknown, allowed: T): value is T[number] =>
  typeof value === "string" && allowed.includes(value);

const addStringIssue = (issues: string[], value: unknown, path: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(`${path} must be a non-empty string`);
  }
};

const addStringArrayIssue = (issues: string[], value: unknown, path: string) => {
  if (!isStringArray(value)) {
    issues.push(`${path} must be an array of strings`);
  }
};

const addOptionalStringIssue = (issues: string[], value: unknown, path: string) => {
  if (value !== undefined && typeof value !== "string") {
    issues.push(`${path} must be a string when provided`);
  }
};

const addScoreIssue = (issues: string[], value: unknown, path: string) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 10) {
    issues.push(`${path} must be a finite number from 0 to 10`);
  }
};

function assertNoIssues<T>(schemaName: string, issues: string[], value: unknown): asserts value is T {
  if (issues.length > 0) {
    throw new SchemaValidationError(schemaName, issues);
  }
  // The `value` parameter is intentionally unused at runtime; it exists only
  // to carry the `asserts value is T` type narrowing for callers.
  void value;
}

const validateScoreBreakdown = (value: unknown, path: string, issues: string[]): value is ScoreBreakdown => {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return false;
  }

  for (const category of scoreCategories) {
    addScoreIssue(issues, value[category], `${path}.${category}`);
  }

  return true;
};

const validatePassportClaimEvidence = (
  value: unknown,
  path: string,
  issues: string[],
  expectedAcceptedAttack: boolean,
): value is PassportClaimEvidence => {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return false;
  }

  addStringIssue(issues, value.claim, `${path}.claim`);
  addStringIssue(issues, value.attackId, `${path}.attackId`);
  addStringIssue(issues, value.defenseId, `${path}.defenseId`);
  if (typeof value.acceptedAttack !== "boolean") {
    issues.push(`${path}.acceptedAttack must be a boolean`);
  } else if (value.acceptedAttack !== expectedAcceptedAttack) {
    issues.push(`${path}.acceptedAttack must be ${String(expectedAcceptedAttack)}`);
  }
  addStringIssue(issues, value.attackerTeamId, `${path}.attackerTeamId`);
  addStringIssue(issues, value.defenderTeamId, `${path}.defenderTeamId`);

  return true;
};

const addPassportClaimEvidenceArrayIssue = (
  issues: string[],
  value: unknown,
  path: string,
  expectedAcceptedAttack: boolean,
) => {
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array of claim evidence objects`);
    return;
  }

  value.forEach((item, index) => {
    validatePassportClaimEvidence(item, `${path}[${index}]`, issues, expectedAcceptedAttack);
  });
};

export function assertBattleBrief(value: unknown): asserts value is BattleBrief {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<BattleBrief>("BattleBrief", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.goal, "goal");
  addStringArrayIssue(issues, value.constraints, "constraints");
  addStringIssue(issues, value.targetUser, "targetUser");
  addStringArrayIssue(issues, value.successCriteria, "successCriteria");
  addStringArrayIssue(issues, value.requiredArtifacts, "requiredArtifacts");
  assertNoIssues<BattleBrief>("BattleBrief", issues, value);
}

export function assertBattle(value: unknown): asserts value is Battle {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Battle>("Battle", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.title, "title");
  addStringIssue(issues, value.idea, "idea");
  if (!isOneOf(value.type, battleTypes)) {
    issues.push("type must be a supported battle type");
  }
  if (!isOneOf(value.status, battleStatuses)) {
    issues.push("status must be a supported battle status");
  }
  if (!isRecord(value.constraints)) {
    issues.push("constraints must be an object");
  } else {
    addStringIssue(issues, value.constraints.timeLimit, "constraints.timeLimit");
    addStringArrayIssue(issues, value.constraints.outputTargets, "constraints.outputTargets");
    addOptionalStringIssue(issues, value.constraints.preference, "constraints.preference");
  }
  addOptionalStringIssue(issues, value.winnerTeamId, "winnerTeamId");
  addStringIssue(issues, value.createdAt, "createdAt");
  addStringIssue(issues, value.updatedAt, "updatedAt");
  assertNoIssues<Battle>("Battle", issues, value);
}

export function assertTeam(value: unknown): asserts value is Team {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Team>("Team", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.battleId, "battleId");
  addStringIssue(issues, value.name, "name");
  addStringIssue(issues, value.strategy, "strategy");
  if (!isOneOf(value.riskProfile, riskProfiles)) {
    issues.push("riskProfile must be safe, balanced, or aggressive");
  }
  addStringIssue(issues, value.eveAgentDirectory, "eveAgentDirectory");
  if (value.score !== undefined) {
    addScoreIssue(issues, value.score, "score");
  }
  assertNoIssues<Team>("Team", issues, value);
}

export function assertProposal(value: unknown): asserts value is Proposal {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Proposal>("Proposal", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.teamId, "teamId");
  addStringIssue(issues, value.productName, "productName");
  addStringIssue(issues, value.oneLiner, "oneLiner");
  addStringIssue(issues, value.targetUser, "targetUser");
  addStringIssue(issues, value.problem, "problem");
  addStringIssue(issues, value.solution, "solution");
  addStringArrayIssue(issues, value.mvpFeatures, "mvpFeatures");
  addStringIssue(issues, value.demoPlan, "demoPlan");
  addStringIssue(issues, value.technicalHighlight, "technicalHighlight");
  addStringArrayIssue(issues, value.risks, "risks");
  addStringIssue(issues, value.whyThisCanWin, "whyThisCanWin");
  assertNoIssues<Proposal>("Proposal", issues, value);
}

export function assertAttack(value: unknown): asserts value is Attack {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Attack>("Attack", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.attackerTeamId, "attackerTeamId");
  addStringIssue(issues, value.targetTeamId, "targetTeamId");
  if (!isOneOf(value.attackType, attackTypes)) {
    issues.push("attackType must be a supported attack type");
  }
  addStringIssue(issues, value.claim, "claim");
  addStringIssue(issues, value.evidence, "evidence");
  if (!isOneOf(value.severity, severities)) {
    issues.push("severity must be low, medium, high, or fatal");
  }
  addStringIssue(issues, value.suggestedFix, "suggestedFix");
  assertNoIssues<Attack>("Attack", issues, value);
}

export function assertDefense(value: unknown): asserts value is Defense {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Defense>("Defense", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.attackId, "attackId");
  addStringIssue(issues, value.teamId, "teamId");
  addStringIssue(issues, value.targetTeamId, "targetTeamId");
  addStringIssue(issues, value.responseToAttack, "responseToAttack");
  if (typeof value.acceptedAttack !== "boolean") {
    issues.push("acceptedAttack must be a boolean");
  }
  addStringIssue(issues, value.revision, "revision");
  assertNoIssues<Defense>("Defense", issues, value);
}

export function assertScore(value: unknown): asserts value is Score {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Score>("Score", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.teamId, "teamId");
  validateScoreBreakdown(value.scores, "scores", issues);
  addStringArrayIssue(issues, value.judgeComments, "judgeComments");
  addOptionalStringIssue(issues, value.winningReason, "winningReason");
  addOptionalStringIssue(issues, value.losingReason, "losingReason");
  assertNoIssues<Score>("Score", issues, value);
}

export function assertArtifact(value: unknown): asserts value is Artifact {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<Artifact>("Artifact", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.battleId, "battleId");
  if (!isOneOf(value.type, artifactTypes)) {
    issues.push("type must be a supported artifact type");
  }
  addStringIssue(issues, value.title, "title");
  addStringIssue(issues, value.content, "content");
  assertNoIssues<Artifact>("Artifact", issues, value);
}

export function assertAgentPassport(value: unknown): asserts value is AgentPassport {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<AgentPassport>("AgentPassport", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.agentId, "agentId");
  addStringIssue(issues, value.battleId, "battleId");
  addStringIssue(issues, value.agentName, "agentName");
  addStringIssue(issues, value.role, "role");
  addStringIssue(issues, value.directoryPath, "directoryPath");
  addStringIssue(issues, value.contributionSummary, "contributionSummary");
  addPassportClaimEvidenceArrayIssue(issues, value.acceptedClaims, "acceptedClaims", true);
  addPassportClaimEvidenceArrayIssue(issues, value.rejectedClaims, "rejectedClaims", false);
  addStringArrayIssue(issues, value.strengths, "strengths");
  addStringArrayIssue(issues, value.weaknesses, "weaknesses");
  addScoreIssue(issues, value.contributionScore, "contributionScore");
  assertNoIssues<AgentPassport>("AgentPassport", issues, value);
}

export function assertBattleEvent(value: unknown): asserts value is BattleEvent {
  const issues: string[] = [];

  if (!isRecord(value)) {
    assertNoIssues<BattleEvent>("BattleEvent", ["value must be an object"], value);
    return;
  }

  addStringIssue(issues, value.id, "id");
  addStringIssue(issues, value.battleId, "battleId");
  addStringIssue(issues, value.round, "round");
  if (!isOneOf(value.actorType, battleActorTypes)) {
    issues.push("actorType must be system, team, agent, or judge");
  }
  addOptionalStringIssue(issues, value.actorId, "actorId");
  addOptionalStringIssue(issues, value.targetId, "targetId");
  if (!isOneOf(value.eventType, battleEventTypes)) {
    issues.push("eventType must be a supported battle event type");
  }
  addStringIssue(issues, value.title, "title");
  addStringIssue(issues, value.content, "content");
  addStringIssue(issues, value.createdAt, "createdAt");
  assertNoIssues<BattleEvent>("BattleEvent", issues, value);
}
