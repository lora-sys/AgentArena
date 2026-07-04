import { type Battle, type BattleEvent, type BattleReplay } from "../schemas";

export type ReplayGeneratorInput = {
  battle: Battle;
  events: BattleEvent[];
  nextId?: (prefix: string) => string;
  now?: () => string;
};

const replayEventTypes = new Set<BattleEvent["eventType"]>([
  "brief_created",
  "team_created",
  "proposal_created",
  "attack_created",
  "defense_created",
  "score_created",
  "champion_selected",
  "artifact_created",
]);

export function generateReplayFromEvents(input: ReplayGeneratorInput): BattleReplay {
  const includedEvents = input.events.filter((event) => event.battleId === input.battle.id && replayEventTypes.has(event.eventType));
  const championEvent = includedEvents.find((event) => event.eventType === "champion_selected");

  return {
    id: input.nextId?.("replay") ?? `replay_${input.battle.id}`,
    battleId: input.battle.id,
    title: `Replay: ${input.battle.title}`,
    summary:
      championEvent === undefined
        ? `Replay generated from ${includedEvents.length} recorded battle events.`
        : `Replay generated from ${includedEvents.length} recorded battle events. ${championEvent.content}`,
    segments: includedEvents.map((event, index) => ({
      id: input.nextId?.("replay_segment") ?? `replay_segment_${String(index + 1).padStart(3, "0")}`,
      eventId: event.id,
      round: event.round,
      actorType: event.actorType,
      actorId: event.actorId,
      targetId: event.targetId,
      title: event.title,
      body: event.content,
      createdAt: event.createdAt,
    })),
    generatedFromEventIds: includedEvents.map((event) => event.id),
    createdAt: input.now?.() ?? new Date(0).toISOString(),
  };
}
