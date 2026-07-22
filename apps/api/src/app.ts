import { Hono } from "hono";
import type { BattleEvent } from "@agent-arena/contracts";
import fixture from "../../../examples/fixtures/hackathon-001.json";

export const app = new Hono();

app.get("/api/health", (context) =>
  context.json({ status: "ok", service: "agent-arena-api" }),
);

app.get("/api/battles/:id", (context) => {
  const battleId = context.req.param("id");
  return context.json({
    battle: {
      id: battleId,
      status: battleId === "demo" ? "completed" : "ready",
    },
  });
});

const teamIds: Record<string, string> = {
  team_safe_v1: "safe_builder",
  team_viral_v1: "viral_designer",
  team_infra_v1: "infra_hacker",
};

function demoEvents(): BattleEvent[] {
  const attacks = new Map(fixture.attacks.map((attack) => [attack.id, attack]));
  let attackCursor = 0;
  let defenseCursor = 0;
  return fixture.events.map((event, index) => {
    let rawPayload: unknown;
    if (event.eventType === "attack_created") {
      const attack = fixture.attacks[attackCursor++];
      if (attack) rawPayload = { ...attack, attackerTeamId: teamIds[attack.attackerTeamId], targetTeamId: teamIds[attack.targetTeamId] };
    }
    if (event.eventType === "defense_created") {
      const defense = fixture.defenses[defenseCursor++];
      const attack = defense ? attacks.get(defense.attackId) : undefined;
      if (defense) rawPayload = { ...defense, teamId: teamIds[defense.teamId], targetTeamId: teamIds[defense.targetTeamId], severity: attack?.severity };
    }
    return {
      id: event.id,
      battleId: "demo",
      sequence: index + 1,
      round: event.round,
      actorId: event.actorId ? (teamIds[event.actorId] ?? event.actorId) : undefined,
      targetId: event.targetId ? (teamIds[event.targetId] ?? event.targetId) : undefined,
      eventType: event.eventType as BattleEvent["eventType"],
      title: event.title,
      content: event.content,
      rawPayload,
      createdAt: event.createdAt,
    };
  });
}

export function normalizeStoredEvent(event: BattleEvent): BattleEvent {
  const envelope = event.rawPayload;
  if (!envelope || typeof envelope !== "object") return event;
  const payload = envelope as { title?: unknown; content?: unknown; rawPayload?: unknown };
  return {
    ...event,
    title: typeof payload.title === "string" ? payload.title : event.title,
    content: typeof payload.content === "string" ? payload.content : event.content,
    rawPayload: payload.rawPayload ?? event.rawPayload,
  };
}

app.get("/api/battles/:id/events", async (context) => {
  const battleId = context.req.param("id");
  if (battleId === "demo" || battleId === fixture.battle.id) {
    return context.json({ battleId, source: "fixture", events: demoEvents() });
  }

  // Postgres/event-store integration is deliberately soft-failing: the replay
  // remains usable and never blocks the battle experience when storage is absent.
  try {
    const { BattleEventStore } = await import("../../../arena/events/event-store-postgres");
    const events = (await new BattleEventStore().list(battleId)).map(normalizeStoredEvent);
    return context.json({ battleId, source: "event-store", events });
  } catch {
    return context.json({ battleId, source: "fallback", events: [] });
  }
});
