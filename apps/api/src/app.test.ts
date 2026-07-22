import { describe, expect, it } from "vitest";
import { app, normalizeStoredEvent } from "./app";

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
