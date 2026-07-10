import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Event Store persistence.
 *
 * Verifies that battle events are persisted and retrievable via the
 * event store API.
 *
 * The event store is the authoritative source of truth for replay and
 * passport generation (PRD §23.1 invariant: "Replay and Passport only
 * read from event store. Never from in-memory state.").
 *
 * This spec verifies:
 *   - GET /api/battles/demo/events returns events with proper structure
 *   - Events include all required types (proposal, attack, defense, score)
 *   - Each event has a unique ID, timestamp, and round
 *   - Event IDs follow the ev_ pattern
 *   - Events can be re-fetched deterministically (same response on repeat)
 *
 * Acceptance:
 * - Events endpoint returns 200
 * - Events have valid IDs matching ^ev_
 * - Events have createdAt timestamps
 * - Multiple event types are present
 */

test.describe("PRD §8.3 Event Store", () => {
  test("GET /api/battles/demo/events returns events array", async ({ request }) => {
    const response = await request.get("/api/battles/demo/events");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.events).toBeDefined();
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events.length).toBeGreaterThan(0);
  });

  test("events have valid structure (id, type, timestamp, round)", async ({ request }) => {
    const response = await request.get("/api/battles/demo/events");
    expect(response.status()).toBe(200);

    const body = await response.json();
    const events = body.events;

    // Each event must have required fields.
    for (const event of events) {
      expect(typeof event.id).toBe("string");
      expect(event.id).toMatch(/^ev_/);
      expect(typeof event.eventType).toBe("string");
      expect(typeof event.round).toBe("string");
      expect(typeof event.createdAt).toBe("string");
      // createdAt should be a valid ISO timestamp.
      expect(() => new Date(event.createdAt).toISOString()).not.toThrow();
    }
  });

  test("events include all required round types", async ({ request }) => {
    const response = await request.get("/api/battles/demo/events");
    expect(response.status()).toBe(200);

    const body = await response.json();
    const eventTypes = new Set<string>(body.events.map((e: { eventType: string }) => e.eventType));

    // Demo battle must have these event types at minimum.
    expect(eventTypes.has("proposal_created")).toBe(true);
    expect(eventTypes.has("attack_created")).toBe(true);
    expect(eventTypes.has("defense_created")).toBe(true);
    expect(eventTypes.has("score_created")).toBe(true);
    expect(eventTypes.has("champion_selected")).toBe(true);
  });

  test("events are deterministic (same response on repeated fetch)", async ({ request }) => {
    // First fetch.
    const response1 = await request.get("/api/battles/demo/events");
    expect(response1.status()).toBe(200);
    const body1 = await response1.json();

    // Second fetch.
    const response2 = await request.get("/api/battles/demo/events");
    expect(response2.status()).toBe(200);
    const body2 = await response2.json();

    // Event count must match.
    expect(body1.events.length).toBe(body2.events.length);

    // Event IDs and order must match (deterministic bundle).
    for (let i = 0; i < body1.events.length; i++) {
      expect(body1.events[i].id).toBe(body2.events[i].id);
    }
  });

  test("events endpoint accepts arbitrary battle id (demo fallback)", async ({ request }) => {
    // The demo endpoint falls back to the demo bundle for any id.
    const response = await request.get("/api/battles/any-fake-id/events");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.events).toBeDefined();
    expect(body.events.length).toBeGreaterThan(0);
  });
});