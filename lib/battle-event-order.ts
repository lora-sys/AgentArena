import type { BattleEvent, Defense } from "@/arena/schemas/types";

type OrderIssue = {
  eventId: string;
  message: string;
};

const asDefense = (event: BattleEvent): Defense | null => {
  if (event.eventType !== "defense_created") return null;
  const payload = event.rawPayload;
  if (!payload || typeof payload !== "object" || !("attackId" in payload)) return null;
  return payload as Defense;
};

/**
 * Protects the presentation layer's sequence fallback until BattleEvent
 * exposes the database sequence field. Partial SSE arrays are accepted:
 * only relationships whose events are already present are checked.
 */
export function validateBattleEventOrder(events: readonly BattleEvent[]): OrderIssue[] {
  const issues: OrderIssue[] = [];
  const seenIds = new Set<string>();
  const proposalIndexByActor = new Map<string, number>();
  const attackIndexById = new Map<string, number>();
  let lastTimestamp = Number.NEGATIVE_INFINITY;
  let lastDefenseIndex = -1;
  let lastScoreIndex = -1;

  events.forEach((event, index) => {
    if (seenIds.has(event.id)) {
      issues.push({ eventId: event.id, message: `duplicate event id at index ${index}` });
    }
    seenIds.add(event.id);

    const timestamp = Date.parse(event.createdAt);
    if (Number.isFinite(timestamp)) {
      if (timestamp < lastTimestamp) {
        issues.push({ eventId: event.id, message: `createdAt moves backwards at index ${index}` });
      }
      lastTimestamp = Math.max(lastTimestamp, timestamp);
    }

    if (event.eventType === "proposal_created" && event.actorId) {
      proposalIndexByActor.set(event.actorId, index);
    }

    if (event.eventType === "attack_created") {
      if (event.actorId && !proposalIndexByActor.has(event.actorId)) {
        issues.push({ eventId: event.id, message: `attack precedes proposal for ${event.actorId}` });
      }
      attackIndexById.set(
        event.rawPayload && typeof event.rawPayload === "object" && "id" in event.rawPayload
          ? String(event.rawPayload.id)
          : event.id,
        index,
      );
    }

    const defense = asDefense(event);
    if (defense) {
      const attackIndex = attackIndexById.get(defense.attackId);
      if (attackIndex === undefined || attackIndex >= index) {
        issues.push({ eventId: event.id, message: `defense precedes attack ${defense.attackId}` });
      }
      lastDefenseIndex = index;
    }

    if (event.eventType === "score_created") {
      if (lastDefenseIndex < 0) {
        issues.push({ eventId: event.id, message: "score precedes all defenses" });
      }
      lastScoreIndex = index;
    }

    if (event.eventType === "champion_selected" && lastScoreIndex < 0) {
      issues.push({ eventId: event.id, message: "champion precedes all scores" });
    }
  });

  return issues;
}

export function assertBattleEventOrder(events: readonly BattleEvent[]): void {
  const issues = validateBattleEventOrder(events);
  if (issues.length > 0) {
    throw new Error(`Battle event order invalid: ${issues.map((issue) => `${issue.eventId}: ${issue.message}`).join("; ")}`);
  }
}
