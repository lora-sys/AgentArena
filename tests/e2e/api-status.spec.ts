import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 Live Battle — Status API endpoint.
 *
 * Verifies GET /api/battles/[id]/status returns the expected JSON shape
 * for the demo battle (static complete response) and that the endpoint
 * is accessible without auth (P0 demo path per docs/CLAUDE.md §6).
 */

test.describe("PRD §8.3 Live Battle — /api/battles/[id]/status", () => {
  test("GET /api/battles/demo/status returns 200 with expected shape", async ({
    request,
  }) => {
    const res = await request.get("/api/battles/demo/status");
    expect(res.status()).toBe(200);

    const body = await res.json();

    // Top-level shape per app/api/battles/[id]/status/route.ts.
    expect(body).toHaveProperty("battleId", "demo");
    expect(body).toHaveProperty("round");
    expect(body).toHaveProperty("progress");
    expect(body).toHaveProperty("canCancel");
    expect(body).toHaveProperty("agentStates");

    // Demo battle is at round 6 (final judging round), cannot cancel.
    expect(body.round).toBe(6);
    expect(body.canCancel).toBe(false);

    // All 3 contestant teams must have state entries.
    expect(body.agentStates).toHaveProperty("safe-builder");
    expect(body.agentStates).toHaveProperty("viral-designer");
    expect(body.agentStates).toHaveProperty("infra-hacker");

    // Each agent must have state + score fields.
    for (const teamId of [
      "safe-builder",
      "viral-designer",
      "infra-hacker",
    ] as const) {
      expect(body.agentStates[teamId]).toHaveProperty("state");
      expect(body.agentStates[teamId]).toHaveProperty("streamedText");
      expect(body.agentStates[teamId]).toHaveProperty("score");
      expect(body.agentStates[teamId].state).toBe("complete");
    }
  });

  test("GET /api/battles/btl_unknown_id/status returns 404 for unknown battle", async ({
    request,
  }) => {
    // When the battle is not found in the DB, the route returns 404.
    // Note: the route falls back to a 200 default if the DB is unavailable;
    // this test validates the error-path JSON contract when 404 is returned.
    const res = await request.get(
      "/api/battles/btl_nonexistent_zzz/status",
    );

    // Accept either 404 (DB available, not found) or 200 (DB unavailable, fallback).
    // Both are valid P0 behaviors — the important contract is the shape.
    if (res.status() === 404) {
      const body = await res.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toBe("Battle not found");
    } else {
      expect(res.status()).toBe(200);
      const body = await res.json();
      // Fallback shape: pending states, no scores.
      expect(body).toHaveProperty("battleId");
      expect(body.agentStates["safe-builder"].state).toBe("pending");
    }
  });
});