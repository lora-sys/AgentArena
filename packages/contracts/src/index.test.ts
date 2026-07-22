import { describe, expect, it } from "vitest";
import { buildPlaybackBatches, reduceArenaHp, type BattleEvent } from ".";

const base = { battleId: "demo", createdAt: "2026-07-04T00:00:00Z", title: "", content: "" };

describe("reduceArenaHp", () => {
  it("only damages a team when the linked attack is accepted", () => {
    const events: BattleEvent[] = [
      { ...base, id: "a1", round: "attack", actorId: "safe", eventType: "attack_created", rawPayload: { id: "a1", attackerTeamId: "safe", targetTeamId: "viral", severity: "high", claim: "fatal demo risk" } },
      { ...base, id: "d1", round: "defense", actorId: "viral", eventType: "defense_created", rawPayload: { id: "d1", attackId: "a1", teamId: "viral", acceptedAttack: true, responseToAttack: "accepted" } },
    ];
    expect(reduceArenaHp(events, ["safe", "viral"])).toEqual({ safe: 100, viral: 70 });
  });
});

describe("buildPlaybackBatches", () => {
  it("starts different actors in the same round together and preserves round order", () => {
    const events: BattleEvent[] = [
      { ...base, id: "p1", round: "proposal", actorId: "safe", eventType: "proposal_created" },
      { ...base, id: "p2", round: "proposal", actorId: "viral", eventType: "proposal_created" },
      { ...base, id: "p3", round: "proposal", actorId: "infra", eventType: "proposal_created" },
      { ...base, id: "a1", round: "attack", actorId: "infra", eventType: "attack_created" },
    ];
    const batches = buildPlaybackBatches(events);
    expect(batches[0]?.events.map((event) => event.actorId)).toEqual(["safe", "viral", "infra"]);
    expect(batches[1]?.events[0]?.eventType).toBe("attack_created");
    expect(events.findIndex((event) => event.eventType === "attack_created")).toBeGreaterThan(
      events.findIndex((event) => event.actorId === "infra" && event.eventType === "proposal_created"),
    );
  });

  it("reveals the champion after scoring even when the store uses one judging round", () => {
    const events: BattleEvent[] = [
      { ...base, id: "s1", round: "judging", eventType: "score_created" },
      { ...base, id: "c1", round: "judging", eventType: "champion_selected" },
    ];
    expect(buildPlaybackBatches(events).map((batch) => batch.events[0]?.eventType)).toEqual(["score_created", "champion_selected"]);
  });
});
