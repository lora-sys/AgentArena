export type Severity = "low" | "medium" | "high" | "fatal";

export type BattleEventType =
  | "brief_created"
  | "team_created"
  | "proposal_created"
  | "attack_created"
  | "defense_created"
  | "score_created"
  | "champion_selected"
  | "passport_created"
  | "artifact_created"
  | "replay_created"
  | "commentary_created"
  | "error";

export type BattleEvent = {
  id: string;
  battleId: string;
  round: string;
  actorId?: string;
  targetId?: string;
  eventType: BattleEventType;
  title: string;
  content: string;
  rawPayload?: unknown;
  sequence?: number;
  createdAt: string;
};

export type AttackPayload = {
  id: string;
  attackerTeamId: string;
  targetTeamId: string;
  severity: Severity;
  claim: string;
};

export type DefensePayload = {
  id: string;
  attackId: string;
  teamId: string;
  acceptedAttack: boolean;
  responseToAttack: string;
};

export type PatchPayload = {
  id: string;
  teamId: string;
  attackId?: string;
  artifactId: string;
  diffText: string;
};

export type TestResultPayload = {
  id: string;
  teamId: string;
  name: string;
  passed: boolean;
  linkedEventIds?: string[];
};

export const DAMAGE_MAP: Record<Severity, number> = {
  low: 5,
  medium: 15,
  high: 30,
  fatal: 50,
};

export const RECOVERY_RATIO = 0.6;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export type ArenaHpReduction = {
  hp: Record<string, number>;
  /** damage actually applied per accepted attack (used for floating damage labels) */
  damageByAttackId: Record<string, number>;
  /** recovery applied per test event id */
  recoveryByTestId: Record<string, number>;
};

/**
 * Rule (write-locked in docs/DEV-STANDARDS.md §8):
 * - For each `defense_created` with acceptedAttack=true, apply `DAMAGE_MAP[attack.severity]` to the
 *   defending team's HP.
 * - After an accepted attack, if a `test_result` for the defending team passes, recover
 *   `round(damage * 0.6)` HP (clamped to 100).
 * - Recovery can only fire once per accepted attack (a test event does not chain-recover).
 *
 * Event types we use for tests: `score_created` is reserved for judges; we treat any event with
 * `rawPayload` matching `TestResultPayload` on eventType `"artifact_created"` with title prefix
 * `test_` as a test pass signal. To keep the contract minimal we also accept a dedicated payload
 * key — the loader maps fixture rows into these events.
 */
export function reduceArenaHp(events: readonly BattleEvent[], teamIds: readonly string[]): ArenaHpReduction {
  const hp: Record<string, number> = Object.fromEntries(teamIds.map((id) => [id, 100]));
  const attacks = new Map<string, AttackPayload>();
  const damageByAttackId: Record<string, number> = {};
  const recoveryByTestId: Record<string, number> = {};
  // attackId → teamId → recovered?
  const recovered: Map<string, Set<string>> = new Map();

  for (const event of events) {
    if (event.eventType === "attack_created" && isRecord(event.rawPayload)) {
      const attack = event.rawPayload as AttackPayload;
      attacks.set(attack.id, attack);
      continue;
    }
    if (event.eventType === "defense_created" && isRecord(event.rawPayload)) {
      const defense = event.rawPayload as DefensePayload;
      if (!defense.acceptedAttack) continue;
      const attack = attacks.get(defense.attackId);
      if (!attack) continue;
      const damage = DAMAGE_MAP[attack.severity];
      hp[defense.teamId] = Math.max(0, (hp[defense.teamId] ?? 100) - damage);
      damageByAttackId[attack.id] = damage;
      continue;
    }
    // Test result pass: any event whose rawPayload looks like TestResultPayload and passed=true
    if (isRecord(event.rawPayload)) {
      const maybe = event.rawPayload as Partial<TestResultPayload>;
      if (typeof maybe.id === "string" && typeof maybe.teamId === "string" && maybe.passed === true) {
        const teamId = maybe.teamId;
        // find most recent accepted attack against this team that has not yet been recovered
        for (const [attackId, attack] of [...attacks.entries()].reverse()) {
          if (attack.targetTeamId !== teamId) continue;
          const damage = damageByAttackId[attackId];
          if (!damage) continue;
          const done = recovered.get(attackId) ?? new Set<string>();
          if (done.has(teamId)) continue;
          const heal = Math.round(damage * RECOVERY_RATIO);
          hp[teamId] = Math.min(100, (hp[teamId] ?? 100) + heal);
          recoveryByTestId[maybe.id] = heal;
          done.add(teamId);
          recovered.set(attackId, done);
          break;
        }
      }
    }
  }
  return { hp, damageByAttackId, recoveryByTestId };
}

export type PlaybackBatch = { round: string; events: BattleEvent[] };

export function buildPlaybackBatches(events: readonly BattleEvent[]): PlaybackBatch[] {
  const batches: PlaybackBatch[] = [];
  for (const event of events) {
    const current = batches[batches.length - 1];
    const startsRevealPhase = event.eventType === "champion_selected";
    if (!current || current.round !== event.round || startsRevealPhase) {
      batches.push({ round: event.round, events: [event] });
      continue;
    }
    current.events.push(event);
  }
  return batches;
}

// ---------------------------------------------------------------------------
// v0.5.2 Contracts v2 — 六维评分 / Passport / Artifact / Evidence Completeness
// ---------------------------------------------------------------------------

/** Evidence completeness per UI Mapping v0.5.1 §7 — gates the Evidence Lens Modal. */
export type EvidenceCompleteness = "full_breakdown" | "linked_evidence" | "insufficient_evidence";

/** One additive/subtractive line inside a dimension. Sum of all deltas == dimension score. */
export type ScoreBreakdownLine = {
  label: string;
  delta: number;
  evidenceEventIds?: string[];
};

/** A single scored dimension. `max` is the cap; `score <= max`. */
export type ScoreDimension = {
  score: number;
  max: number;
  breakdown: ScoreBreakdownLine[];
  completeness: EvidenceCompleteness;
};

/**
 * Six judging dimensions (Chinese-keyed).
 * Write-locked maxes per docs/DEV-STANDARDS.md §8:
 *   feasibility_zh 25 · originality 25 · demoPower 25 · technicalDepth 15 · clarity 10 · riskControl 5
 * Total max = 105 (displayed as x/100 by scaling where the UI needs it; the passport stores raw).
 */
export type SixDimensionScore = {
  feasibility_zh: ScoreDimension;
  originality: ScoreDimension;
  demoPower: ScoreDimension;
  technicalDepth: ScoreDimension;
  clarity: ScoreDimension;
  riskControl: ScoreDimension;
};

export const SIX_DIMENSION_MAX: Record<keyof SixDimensionScore, number> = {
  feasibility_zh: 25,
  originality: 25,
  demoPower: 25,
  technicalDepth: 15,
  clarity: 10,
  riskControl: 5,
};

export type PassportJourneyStep = {
  round: string;
  eventId: string;
  title: string;
};

/** Champion-page passport snapshot for one team. */
export type TeamPassport = {
  teamId: string;
  teamName: string;
  accentColor: string;
  totalScore: number;
  scores: SixDimensionScore;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  journey: PassportJourneyStep[];
  evidenceCompleteness: EvidenceCompleteness;
};

/** One version of a code/document artifact produced during the battle. */
export type ArtifactVersion = {
  version: number;
  label: string;
  contentText: string;
  createdAt: string;
  linkedEventId: string;
};

/** Bundle powering the Artifact Viewer Modal. */
export type ArtifactBundle = {
  artifactId: string;
  teamId: string;
  title: string;
  currentVersion: number;
  versions: ArtifactVersion[];
  patchDiffText?: string;
  testResults: TestResultPayload[];
  linkedEvidenceEventIds: string[];
};

/** A champion record at battle completion. */
export type ChampionRecord = {
  teamId: string;
  totalScore: number;
  passport: TeamPassport;
};
