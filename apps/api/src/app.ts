import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { BattleEvent } from "@agent-arena/contracts";
import fixture from "../../../examples/fixtures/hackathon-001.json";
import verifiedShowcase from "../../../examples/fixtures/verified-showcase.json";
import { runLiveBattleFromPayload } from "@/lib/runtime/runLiveBattleFromPayload";
import { BattleRateLimiter } from "./middlewares/rate-limit";
import { isLiveBattleEnabled } from "./middlewares/feature-flag";
import { LocalLiveBattleStore } from "./live-battle-store";

export const app = new Hono();

const liveBattleRateLimiter = new BattleRateLimiter();
const liveBattleStore = new LocalLiveBattleStore();
type LiveMessage = { type: "battle"; event: BattleEvent } | { type: "done" } | { type: "error"; error: string };
const liveSubscribers = new Map<string, Set<(message: LiveMessage) => Promise<void>>>();
const liveRuns = new Map<string, Promise<void>>();

async function publishLiveMessage(battleId: string, message: LiveMessage): Promise<void> {
  const subscribers = [...(liveSubscribers.get(battleId) ?? [])];
  await Promise.allSettled(subscribers.map((subscriber) => subscriber(message)));
}

function startLiveBattle(battleId: string, idea: string): Promise<void> {
  const existing = liveRuns.get(battleId);
  if (existing) return existing;
  const run = (async () => {
    try {
      for await (const event of runLiveBattleFromPayload({ battleId, idea })) {
        await liveBattleStore.append(battleId, event);
        await publishLiveMessage(battleId, { type: "battle", event });
      }
      await liveBattleStore.finish(battleId, "completed");
      await publishLiveMessage(battleId, { type: "done" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "实时战斗异常中断";
      await liveBattleStore.finish(battleId, "failed", message);
      await publishLiveMessage(battleId, { type: "error", error: message });
    } finally {
      liveRuns.delete(battleId);
    }
  })();
  liveRuns.set(battleId, run);
  return run;
}

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

/** Map verified-showcase fixture events to contracts BattleEvent shape. */
function verifiedShowcaseEvents(): BattleEvent[] {
  return (verifiedShowcase.events as ReadonlyArray<{
    id: string;
    battleId: string;
    round: string;
    actorId?: string;
    targetId?: string;
    eventType: string;
    title: string;
    content: string;
    rawPayload?: unknown;
    createdAt: string;
  }>).map((event, index) => ({
    id: event.id,
    battleId: event.battleId,
    round: event.round,
    actorId: event.actorId,
    targetId: event.targetId,
    eventType: event.eventType as BattleEvent["eventType"],
    title: event.title,
    content: event.content,
    rawPayload: event.rawPayload,
    sequence: index + 1,
    createdAt: event.createdAt,
  }));
}

app.get("/api/battles/:id/events", async (context) => {
  const battleId = context.req.param("id");
  if (battleId === "BA-2026-0024") {
    return context.json({ battleId, source: "fixture", events: verifiedShowcaseEvents() });
  }
  if (battleId === "demo" || battleId === fixture.battle.id) {
    return context.json({ battleId, source: "fixture", events: demoEvents() });
  }

  const localBattle = await liveBattleStore.get(battleId);
  if (localBattle) {
    return context.json({ battleId, source: "local-event-store", status: localBattle.status, error: localBattle.error, events: localBattle.events });
  }

  // Avoid loading the full Postgres adapter when persistence is not configured.
  // The documented fallback is immediate and must not spend the request budget
  // compiling database drivers only to discover DATABASE_URL is absent.
  if (!process.env.DATABASE_URL) {
    return context.json({ battleId, source: "fallback", events: [] });
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

// ---------------------------------------------------------------------------
// v0.5.2 D 线：live_runtime (StepFun) — issue #44
// ---------------------------------------------------------------------------

app.post("/api/battles", async (context) => {
  if (!isLiveBattleEnabled()) {
    return context.json({ error: "实时 AI 竞技当前未开启，请观看已验证演示" }, 501);
  }

  let body: { idea?: unknown };
  try {
    body = await context.req.json();
  } catch {
    return context.json({ error: "请求体必须是 JSON" }, 400);
  }
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  if (idea.length === 0) {
    return context.json({ error: "创意不能为空" }, 400);
  }

  const trustProxyHeaders = process.env.TRUST_PROXY_HEADERS === "true";
  const ip = trustProxyHeaders
    ? context.req.header("cf-connecting-ip") ?? context.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "proxied-client"
    : "direct-client";
  const decision = liveBattleRateLimiter.check(ip);
  if (!decision.allowed) {
    return context.json(
      { error: "操作过于频繁，请稍后再试" },
      429,
      { "Retry-After": String(decision.retryAfterSeconds) },
    );
  }

  const battleId = `live_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await liveBattleStore.create(battleId, idea);
  return context.json({ battleId, sseUrl: `/api/battles/${battleId}/stream` }, 201);
});

app.get("/api/battles/:id/stream", async (context) => {
  if (!isLiveBattleEnabled()) {
    return context.json({ error: "实时 AI 竞技当前未开启" }, 501);
  }
  const battleId = context.req.param("id");
  const stored = await liveBattleStore.get(battleId);
  if (!stored) {
    return context.json({ error: "找不到该战斗" }, 404);
  }

  return streamSSE(context, async (stream) => {
    const configuredHeartbeatMs = Number.parseInt(process.env.SSE_HEARTBEAT_MS ?? "2000", 10);
    const heartbeatMs = Math.min(3000, Math.max(1000, Number.isFinite(configuredHeartbeatMs) ? configuredHeartbeatMs : 2000));
    let closed = false;
    const heartbeat = setInterval(() => {
      if (closed) return;
      void stream.writeSSE({ event: "heartbeat", data: JSON.stringify({ at: Date.now() }) });
    }, heartbeatMs);

    const sentIds = new Set<string>();
    let writeQueue = Promise.resolve();
    const write = (event: string, data: unknown): Promise<void> => {
      writeQueue = writeQueue.then(() => stream.writeSSE({ event, data: JSON.stringify(data) }));
      return writeQueue;
    };
    let resolveStream: () => void = () => undefined;
    const completed = new Promise<void>((resolve) => { resolveStream = resolve; });
    const subscriber = async (message: LiveMessage): Promise<void> => {
      if (message.type === "battle") {
        if (sentIds.has(message.event.id)) return;
        sentIds.add(message.event.id);
        await write("battle", message.event);
        return;
      }
      if (message.type === "done") await write("done", { battleId });
      else await write("error", { error: message.error });
      liveSubscribers.get(battleId)?.delete(subscriber);
      resolveStream();
    };

    try {
      const subscribers = liveSubscribers.get(battleId) ?? new Set();
      subscribers.add(subscriber);
      liveSubscribers.set(battleId, subscribers);

      const latest = await liveBattleStore.get(battleId);
      if (!latest) return;
      for (const event of latest.events) {
        if (sentIds.has(event.id)) continue;
        sentIds.add(event.id);
        await write("battle", event);
      }
      if (latest.status === "completed") {
        await write("done", { battleId });
        return;
      }
      if (latest.status === "failed") {
        await write("error", { error: latest.error ?? "实时战斗异常中断" });
        return;
      }
      if (latest.status === "running" && !liveRuns.has(battleId)) {
        const interruption = "服务恢复后检测到未完成战斗；已保留现有证据，请重新发起以避免重复运行智能体。";
        await liveBattleStore.finish(battleId, "failed", interruption);
        await write("error", { error: interruption });
        return;
      }
      void startLiveBattle(battleId, latest.idea);
      await completed;
    } finally {
      liveSubscribers.get(battleId)?.delete(subscriber);
      closed = true;
      clearInterval(heartbeat);
    }
  });
});
