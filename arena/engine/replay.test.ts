import { describe, expect, it } from "vitest";
import { generateReplayFromEvents, type ReplayGeneratorInput } from "./replay";
import type { Battle, BattleEvent, BattleEventType } from "../schemas";

const makeBattle = (overrides: Partial<Battle> = {}): Battle => ({
  id: "btl_TESTTEST",
  title: "Test Battle",
  idea: "An idea",
  type: "hackathon",
  status: "completed",
  constraints: { timeLimit: "48h", outputTargets: ["product_brief"] },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  ...overrides,
});

const makeEvent = (overrides: Partial<BattleEvent> & { eventType: BattleEventType }): BattleEvent => ({
  id: "evt_001",
  battleId: "btl_TESTTEST",
  round: "proposal_round",
  actorType: "system",
  title: "Test event",
  content: "Test content",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
  eventType: overrides.eventType ?? "brief_created",
});

describe("generateReplayFromEvents", () => {
  it("generates a replay with no events", () => {
    const input: ReplayGeneratorInput = { battle: makeBattle(), events: [] };
    const result = generateReplayFromEvents(input);
    expect(result.battleId).toBe("btl_TESTTEST");
    expect(result.segments).toEqual([]);
    expect(result.generatedFromEventIds).toEqual([]);
  });

  it("includes only replay-relevant event types", () => {
    const events: BattleEvent[] = [
      makeEvent({ id: "evt_1", eventType: "brief_created" }),
      makeEvent({ id: "evt_2", eventType: "error" }),
      makeEvent({ id: "evt_3", eventType: "passport_created" }),
      makeEvent({ id: "evt_4", eventType: "champion_selected" }),
    ];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    expect(result.segments.map((s) => s.eventId)).toEqual(["evt_1", "evt_4"]);
  });

  it("excludes events from other battles", () => {
    const events: BattleEvent[] = [
      makeEvent({ id: "evt_1", battleId: "btl_TESTTEST", eventType: "brief_created" }),
      makeEvent({ id: "evt_2", battleId: "btl_OTHER000", eventType: "brief_created" }),
    ];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    expect(result.segments).toHaveLength(1);
  });

  it("produces a summary that mentions the champion when a champion_selected event is present", () => {
    const events: BattleEvent[] = [
      makeEvent({
        id: "evt_champ",
        eventType: "champion_selected",
        content: "team_a won the battle with a score of 8.5",
      }),
    ];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    expect(result.summary).toContain("team_a won");
  });

  it("produces a summary that does NOT mention champion when no champion_selected event exists", () => {
    const events: BattleEvent[] = [
      makeEvent({ id: "evt_1", eventType: "brief_created" }),
    ];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    expect(result.summary).toMatch(/^Replay generated from \d+ recorded battle events\.$/);
  });

  it("uses custom nextId when provided", () => {
    const events: BattleEvent[] = [makeEvent({ id: "evt_1", eventType: "brief_created" })];
    const result = generateReplayFromEvents({
      battle: makeBattle(),
      events,
      nextId: (prefix) => `custom_${prefix}_1`,
    });
    expect(result.id).toBe("custom_replay_1");
    expect(result.segments[0].id).toBe("custom_replay_segment_1");
  });

  it("uses default id format when nextId is not provided", () => {
    const events: BattleEvent[] = [makeEvent({ id: "evt_1", eventType: "brief_created" })];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    expect(result.id).toBe("replay_btl_TESTTEST");
    expect(result.segments[0].id).toMatch(/^replay_segment_\d{3}$/);
  });

  it("uses custom now() when provided", () => {
    const result = generateReplayFromEvents({
      battle: makeBattle(),
      events: [],
      now: () => "2026-06-15T12:00:00.000Z",
    });
    expect(result.createdAt).toBe("2026-06-15T12:00:00.000Z");
  });

  it("uses epoch as default createdAt when now is not provided", () => {
    const result = generateReplayFromEvents({ battle: makeBattle(), events: [] });
    expect(result.createdAt).toBe(new Date(0).toISOString());
  });

  it("maps event fields to segment fields", () => {
    const events: BattleEvent[] = [
      makeEvent({
        id: "evt_1",
        eventType: "proposal_created",
        round: "proposal_round",
        actorType: "team",
        actorId: "team_a",
        targetId: "team_b",
        title: "Proposal",
        content: "Body",
        createdAt: "2026-02-01T00:00:00.000Z",
      }),
    ];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    const segment = result.segments[0];
    expect(segment.eventId).toBe("evt_1");
    expect(segment.round).toBe("proposal_round");
    expect(segment.actorType).toBe("team");
    expect(segment.actorId).toBe("team_a");
    expect(segment.targetId).toBe("team_b");
    expect(segment.title).toBe("Proposal");
    expect(segment.body).toBe("Body");
    expect(segment.createdAt).toBe("2026-02-01T00:00:00.000Z");
  });

  it("includes all event ids in generatedFromEventIds", () => {
    const events: BattleEvent[] = [
      makeEvent({ id: "evt_1", eventType: "brief_created" }),
      makeEvent({ id: "evt_2", eventType: "team_created" }),
      makeEvent({ id: "evt_3", eventType: "proposal_created" }),
    ];
    const result = generateReplayFromEvents({ battle: makeBattle(), events });
    expect(result.generatedFromEventIds).toEqual(["evt_1", "evt_2", "evt_3"]);
  });

  it("includes the battle title in the replay title", () => {
    const result = generateReplayFromEvents({
      battle: makeBattle({ title: "My Amazing Battle" }),
      events: [],
    });
    expect(result.title).toBe("Replay: My Amazing Battle");
  });
});
