import type { Attack, BattleEvent, Defense, Severity } from "@/arena/schemas/types";

export const DAMAGE_MAP: Record<Severity, number> = {
  low: 5,
  medium: 15,
  high: 30,
};

export type ArenaHpState = Record<string, number>;

export type PlaybackBatch = {
  key: string;
  round: string;
  roundIndex: number;
  waveIndex: number;
  events: BattleEvent[];
};

const payloadId = (event: BattleEvent): string | null => {
  const payload = event.rawPayload;
  return payload && typeof payload === "object" && "id" in payload ? String(payload.id) : null;
};

const asAttack = (event: BattleEvent): Attack | null =>
  event.eventType === "attack_created" && event.rawPayload && typeof event.rawPayload === "object"
    ? (event.rawPayload as Attack)
    : null;

const asDefense = (event: BattleEvent): Defense | null =>
  event.eventType === "defense_created" && event.rawPayload && typeof event.rawPayload === "object"
    ? (event.rawPayload as Defense)
    : null;

export function buildPlaybackBatches(events: readonly BattleEvent[]): PlaybackBatch[] {
  const rounds: Array<{ round: string; events: BattleEvent[] }> = [];
  for (const event of events) {
    const latest = rounds[rounds.length - 1];
    if (!latest || latest.round !== event.round) {
      rounds.push({ round: event.round, events: [event] });
    } else {
      latest.events.push(event);
    }
  }

  return rounds.flatMap((roundGroup, roundIndex) => {
    const actorWave = new Map<string, number>();
    const waves: BattleEvent[][] = [];
    for (const event of roundGroup.events) {
      const actorKey = event.actorId ?? `${event.actorType}:${event.eventType}`;
      const waveIndex = actorWave.get(actorKey) ?? 0;
      actorWave.set(actorKey, waveIndex + 1);
      (waves[waveIndex] ??= []).push(event);
    }
    return waves.map((waveEvents, waveIndex) => ({
      key: `${roundGroup.round}:${waveIndex}`,
      round: roundGroup.round,
      roundIndex,
      waveIndex,
      events: waveEvents,
    }));
  });
}

export function reduceArenaHp(
  events: readonly BattleEvent[],
  teamIds: readonly string[],
): ArenaHpState {
  const hp = Object.fromEntries(teamIds.map((teamId) => [teamId, 100]));
  const attacks = new Map<string, Attack>();

  for (const event of events) {
    const attack = asAttack(event);
    if (attack) attacks.set(payloadId(event) ?? attack.id, attack);

    const defense = asDefense(event);
    if (!defense?.acceptedAttack) continue;
    const acceptedAttack = attacks.get(defense.attackId);
    if (!acceptedAttack) continue;
    hp[defense.teamId] = Math.max(0, (hp[defense.teamId] ?? 100) - DAMAGE_MAP[acceptedAttack.severity]);
  }

  return hp;
}

export function getAcceptedHit(
  event: BattleEvent,
  eventsThroughEvent: readonly BattleEvent[],
): { teamId: string; severity: Severity; damage: number; hitId: string } | null {
  const defense = asDefense(event);
  if (!defense?.acceptedAttack) return null;
  const attackEvent = eventsThroughEvent.find(
    (candidate) => candidate.eventType === "attack_created" && payloadId(candidate) === defense.attackId,
  );
  const attack = attackEvent ? asAttack(attackEvent) : null;
  if (!attack) return null;
  return {
    teamId: defense.teamId,
    severity: attack.severity,
    damage: DAMAGE_MAP[attack.severity],
    hitId: event.id,
  };
}
