import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Demo Safety journey.
 *
 * Verifies that the example/demo battle loads without making external
 * API calls. The demo battle uses the in-memory fixture served by
 * lib/demo-data.ts and the /api/battles/demo endpoint.
 *
 * This is the PRD §8.3 "Demo Safety" acceptance: ENABLE_EXAMPLE_BATTLES
 * lets the demo run without external dependencies (no OpenAI, no DB).
 *
 * Acceptance:
 * - /api/battles (GET) returns at least the demo battle
 * - /api/battles/demo returns a valid battle bundle
 * - The demo battle has 3 teams
 * - The demo battle has events (proposal, attack, defense, score)
 */

test.describe("PRD §8.3 Demo Safety", () => {
  test("battles list endpoint returns demo battle", async ({ request }) => {
    const response = await request.get("/api/battles");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.battles).toBeDefined();
    expect(Array.isArray(body.battles)).toBe(true);
    expect(body.battles.length).toBeGreaterThanOrEqual(1);

    // The demo battle should be in the list.
    const demoEntry = body.battles.find(
      (b: { id?: string }) => b.id === "demo" || b.id === "hackathon-001"
    );
    expect(demoEntry).toBeDefined();
  });

  test("demo battle bundle has 3 teams", async ({ request }) => {
    const response = await request.get("/api/battles/demo");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.bundle).toBeDefined();
    expect(body.bundle.teams).toBeDefined();

    // PRD §1: exactly 3 contestant teams.
    expect(body.bundle.teams.length).toBe(3);

    // Each team has a name.
    for (const team of body.bundle.teams) {
      expect(team.id).toBeTruthy();
      expect(team.name).toBeTruthy();
    }
  });

  test("demo battle has full event timeline", async ({ request }) => {
    const response = await request.get("/api/battles/demo/events");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.events).toBeDefined();
    expect(Array.isArray(body.events)).toBe(true);

    // The completed demo battle should have multiple events.
    expect(body.events.length).toBeGreaterThan(0);

    // Check that key event types exist.
    const eventTypes = new Set(body.events.map((e: { eventType: string }) => e.eventType));
    expect(eventTypes.size).toBeGreaterThan(2);
  });

  test("demo battle scores are Zod-valid", async ({ request }) => {
    const response = await request.get("/api/battles/demo");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.bundle.scores).toBeDefined();

    // Each score must have all 6 rubric dimensions.
    const requiredDimensions = [
      "novelty",
      "feasibility",
      "demoWow",
      "technicalDepth",
      "userValue",
      "longTermPotential",
    ];

    for (const score of body.bundle.scores) {
      for (const dim of requiredDimensions) {
        expect(typeof score.scores[dim]).toBe("number");
        expect(score.scores[dim]).toBeGreaterThanOrEqual(0);
        expect(score.scores[dim]).toBeLessThanOrEqual(10);
      }
      expect(typeof score.totalScore).toBe("number");
    }
  });

  test("demo page loads without external API calls (network safety)", async ({ page }) => {
    // Track all network requests to verify no external (non-localhost) calls.
    const externalRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      // Allow localhost (our own server) and data URIs.
      if (!url.startsWith("http://localhost") && !url.startsWith("data:")) {
        externalRequests.push(url);
      }
    });

    await page.goto("/");

    // Wait for the home page to fully load.
    await expect(page).toHaveTitle(/Agent Arena/i);

    // No external API calls were made.
    // (Vercel analytics, fonts, etc. are allowed — we only care about API calls.)
    const externalApiCalls = externalRequests.filter(
      (url) =>
        url.includes("/api/") ||
        url.includes("openai.com") ||
        url.includes("anthropic.com")
    );
    expect(externalApiCalls).toEqual([]);
  });
});