export type Severity = "low" | "medium" | "high";

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
  | "commentary_created";

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

export const DAMAGE_MAP: Record<Severity, number> = {
  low: 5,
  medium: 15,
  high: 30,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function reduceArenaHp(events: readonly BattleEvent[], teamIds: readonly string[]) {
  const hp: Record<string, number> = Object.fromEntries(teamIds.map((id) => [id, 100]));
  const attacks = new Map<string, AttackPayload>();

  for (const event of events) {
    if (event.eventType === "attack_created" && isRecord(event.rawPayload)) {
      const attack = event.rawPayload as AttackPayload;
      attacks.set(attack.id, attack);
    }
    if (event.eventType !== "defense_created" || !isRecord(event.rawPayload)) continue;
    const defense = event.rawPayload as DefensePayload;
    if (!defense.acceptedAttack) continue;
    const attack = attacks.get(defense.attackId);
    if (!attack) continue;
    hp[defense.teamId] = Math.max(0, (hp[defense.teamId] ?? 100) - DAMAGE_MAP[attack.severity]);
  }
  return hp;
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
