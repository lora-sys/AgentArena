import { describe, expect, it } from "vitest";
import { app, normalizeStoredEvent } from "./app";
import { BattleRateLimiter } from "./middlewares/rate-limit";

describe("API shell", () => {
  it("reports health without Next.js", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ok" });
  });

  it("returns the completed demo event chain in insertion order", async () => {
    const response = await app.request("/api/battles/demo/events");
    expect(response.status).toBe(200);
    const body = await response.json() as { source: string; events: Array<{ eventType: string }> };
    expect(body.source).toBe("fixture");
    expect(body.events.length).toBeGreaterThan(10);
    expect(body.events.findIndex((event) => event.eventType === "attack_created")).toBeGreaterThan(
      body.events.findIndex((event) => event.eventType === "proposal_created"),
    );
  });

  it("fails softly when a real battle cannot be loaded", async () => {
    const response = await app.request("/api/battles/battle-missing/events");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ source: "fallback", events: [] });
  });

  it("serves the exact same demo chain three consecutive times", async () => {
    const runs = await Promise.all(Array.from({ length: 3 }, async () => {
      const response = await app.request("/api/battles/demo/events");
      const body = await response.json() as { events: Array<{ id: string }> };
      return body.events.map((event) => event.id);
    }));
    expect(runs[1]).toEqual(runs[0]);
    expect(runs[2]).toEqual(runs[0]);
  });

  it("unwraps persisted event content without changing the event contract", () => {
    const event = normalizeStoredEvent({
      id: "e1", battleId: "b1", round: "proposal_round", eventType: "proposal_created",
      title: "", content: "", createdAt: "2026-01-01T00:00:00Z",
      rawPayload: { title: "Stored title", content: "Stored copy", rawPayload: { proposalId: "p1" } },
    });
    expect(event).toMatchObject({ title: "Stored title", content: "Stored copy", rawPayload: { proposalId: "p1" } });
  });

  it("lists replayable battles for the archive", async () => {
    const response = await app.request("/api/battles");
    const body = await response.json() as { battles: Array<{ id: string; winnerName: string; eventCount: number }> };
    expect(body.battles[0]).toMatchObject({ id: "demo", winnerName: "Safe Builders", eventCount: 22 });
  });

  it("returns a passport with strengths, weaknesses, and evidence links", async () => {
    const response = await app.request("/api/agents/infra-hacker/passport");
    expect(response.status).toBe(200);
    const body = await response.json() as { passport: { strengths: string[]; weaknesses: string[]; evidence: Array<{ eventId: string }> } };
    expect(body.passport.strengths.length).toBeGreaterThan(0);
    expect(body.passport.weaknesses.length).toBeGreaterThan(0);
    expect(body.passport.evidence[0]?.eventId).toMatch(/^defense_/);
  });
});

describe("POST /api/battles (live_runtime) — issue #44", () => {
  it("returns 501 when AGENT_ARENA_LIVE_BATTLE_ENABLED is not set", async () => {
    const backup = process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
    delete process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
    try {
      const response = await app.request("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: "帮助大学生准备考试的 AI 学习助手" }),
      });
      expect(response.status).toBe(501);
      const body = await response.json() as { error: string };
      expect(body.error).toContain("实时 AI 竞技当前未开启");
    } finally {
      if (backup !== undefined) process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = backup;
    }
  });

  it("returns 501 when flag is 'false'", async () => {
    const backup = process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
    process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = "false";
    try {
      const response = await app.request("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: "test" }),
      });
      expect(response.status).toBe(501);
    } finally {
      if (backup === undefined) delete process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
      else process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = backup;
    }
  });

  it("returns 400 on empty idea", async () => {
    const backup = process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
    process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = "true";
    try {
      const response = await app.request("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: "   " }),
      });
      expect(response.status).toBe(400);
    } finally {
      if (backup === undefined) delete process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
      else process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = backup;
    }
  });

  it("returns 400 on malformed JSON", async () => {
    const backup = process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
    process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = "true";
    try {
      const response = await app.request("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      });
      expect(response.status).toBe(400);
    } finally {
      if (backup === undefined) delete process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
      else process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = backup;
    }
  });

  it("accepts a valid idea and returns battleId + sseUrl", async () => {
    const backup = process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
    process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = "true";
    try {
      const response = await app.request("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: "帮助大学生准备考试的 AI 学习助手" }),
      });
      expect(response.status).toBe(201);
      const body = await response.json() as { battleId: string; sseUrl: string };
      expect(body.battleId).toMatch(/^live_/);
      expect(body.sseUrl).toBe(`/api/battles/${body.battleId}/stream`);
    } finally {
      if (backup === undefined) delete process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
      else process.env.AGENT_ARENA_LIVE_BATTLE_ENABLED = backup;
    }
  });
});

describe("BattleRateLimiter (unit) — issue #44", () => {
  it("allows 5 attempts per window then 429s", () => {
    let tick = 1_000_000;
    const limiter = new BattleRateLimiter({ now: () => tick });
    for (let i = 0; i < 5; i++) {
      expect(limiter.check("ip-1").allowed).toBe(true);
    }
    const denied = limiter.check("ip-1");
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("resets after the window", () => {
    let tick = 1_000_000;
    const limiter = new BattleRateLimiter({ now: () => tick, windowMs: 10_000, maxAttempts: 2 });
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(false);
    tick += 11_000;
    expect(limiter.check("ip-1").allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    const limiter = new BattleRateLimiter({ maxAttempts: 1 });
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-2").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(false);
    expect(limiter.check("ip-2").allowed).toBe(false);
  });
});
