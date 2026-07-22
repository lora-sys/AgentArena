import { Hono } from "hono";
import type { BattleEvent } from "@agent-arena/contracts";
import fixture from "../../../examples/fixtures/hackathon-001.json";

export const app = new Hono();

app.get("/api/health", (context) =>
  context.json({ status: "ok", service: "agent-arena-api" }),
);

app.get("/api/battles", (context) => context.json({
  battles: [{
    id: "demo",
    title: fixture.battle.title,
    idea: fixture.battle.idea,
    status: fixture.battle.status,
    winnerName: fixture.teams.find((team) => team.id === fixture.battle.winnerTeamId)?.name ?? "Safe Builders",
    agents: fixture.teams.map((team) => team.name),
    eventCount: demoEvents().length,
    updatedAt: fixture.battle.updatedAt,
  }],
}));

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
  const base = fixture.events.filter((event) => !["attack_created", "defense_created"].includes(event.eventType)).map((event) => ({
      id: event.id,
      battleId: "demo",
      round: event.round,
      actorId: event.actorId ? (teamIds[event.actorId] ?? event.actorId) : undefined,
      targetId: event.targetId ? (teamIds[event.targetId] ?? event.targetId) : undefined,
      eventType: event.eventType as BattleEvent["eventType"],
      title: event.title,
      content: event.content,
      createdAt: event.createdAt,
  }));
  const attackEvents: BattleEvent[] = fixture.attacks.map((attack, index) => ({ id: `attack_${attack.id}`, battleId: "demo", round: "cross_attack_round", actorId: teamIds[attack.attackerTeamId], targetId: teamIds[attack.targetTeamId], eventType: "attack_created", title: `Attack: ${attack.attackType}`, content: attack.claim, rawPayload: { ...attack, attackerTeamId: teamIds[attack.attackerTeamId], targetTeamId: teamIds[attack.targetTeamId] }, createdAt: `2026-06-01T11:${String(index).padStart(2,"0")}:00.000Z` }));
  const defenseEvents: BattleEvent[] = fixture.defenses.map((defense, index) => ({ id: `defense_${defense.id}`, battleId: "demo", round: "defense_round", actorId: teamIds[defense.teamId], targetId: teamIds[defense.targetTeamId], eventType: "defense_created", title: `Defense: ${defense.attackId}`, content: defense.responseToAttack, rawPayload: { ...defense, teamId: teamIds[defense.teamId], targetTeamId: teamIds[defense.targetTeamId] }, createdAt: `2026-06-01T12:${String(index).padStart(2,"0")}:00.000Z` }));
  const proposalEnd = base.findIndex((event) => event.eventType === "score_created");
  return [...base.slice(0, proposalEnd), ...attackEvents, ...defenseEvents, ...base.slice(proposalEnd)].map((event, index) => ({ ...event, sequence: index + 1 }));
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

const agentSlugToId: Record<string, string> = {
  "safe-builder": "agent_safe_builder_lead",
  "viral-designer": "agent_viral_designer_lead",
  "infra-hacker": "agent_infra_hacker_lead",
};

app.get("/api/agents/:id/passport", (context) => {
  const slug = context.req.param("id");
  const agentId = agentSlugToId[slug] ?? slug;
  const passport = fixture.passports.find((candidate) => candidate.agentId === agentId);
  if (!passport) return context.json({ error: "Passport not found" }, 404);
  const teamId = fixture.agentDefinitions.find((agent) => agent.id === agentId)?.teamId;
  const score = fixture.scores.find((candidate) => candidate.teamId === teamId);
  const reputation = score ? Object.values(score.scores).reduce((sum, value) => sum + value, 0) / Object.values(score.scores).length : passport.contributionScore;
  const mappedEvents = demoEvents();
  const evidence = [...passport.acceptedClaims, ...passport.rejectedClaims].map((claim) => {
    const event = mappedEvents.find((candidate) => candidate.eventType === "defense_created" && (candidate.rawPayload as { attackId?: string } | undefined)?.attackId === claim.attackId);
    return { eventId: event?.id ?? "evt_001", claim: claim.claim, accepted: claim.acceptedAttack, attackId: claim.attackId, defenseId: claim.defenseId };
  });
  return context.json({ passport: {
    agentId: slug,
    agentName: passport.agentName,
    role: passport.role,
    contributionSummary: passport.contributionSummary,
    reputation: Math.round(reputation * 100) / 100,
    strengths: passport.strengths,
    weaknesses: passport.weaknesses,
    acceptedCount: passport.acceptedClaims.length,
    rejectedCount: passport.rejectedClaims.length,
    evidence,
    trend: score ? Object.values(score.scores).map((value, index) => ({ label: ["NOV", "FEA", "WOW", "TECH", "VALUE", "LONG"][index], value: Math.round(value * 10) })) : [],
    battles: [{ id: "demo", title: fixture.battle.title, result: teamId === fixture.battle.winnerTeamId ? "WIN" : "PLACED", date: fixture.battle.updatedAt }],
  }});
});
