import { describe, expect, it } from "vitest";
import { runDemoBattle } from "@/arena/engine/demo-battle";
import type { BattleEvent } from "@/arena/schemas/types";
import { assertBattleEventOrder, validateBattleEventOrder } from "./battle-event-order";

describe("battle event order", () => {
  it("accepts the deterministic Example Battle order", () => {
    const events = runDemoBattle().events;
    expect(validateBattleEventOrder(events)).toEqual([]);
    expect(() => assertBattleEventOrder(events)).not.toThrow();
  });

  it("detects an attack moved before its proposal", () => {
    const events = [...runDemoBattle().events];
    const attackIndex = events.findIndex((event) => event.eventType === "attack_created");
    const [attack] = events.splice(attackIndex, 1);
    events.unshift(attack);
    expect(validateBattleEventOrder(events).some((issue) => issue.message.includes("attack precedes proposal"))).toBe(true);
  });

  it("detects a defense moved before its attack", () => {
    const events = [...runDemoBattle().events];
    const defenseIndex = events.findIndex((event) => event.eventType === "defense_created");
    const [defense] = events.splice(defenseIndex, 1);
    const firstAttackIndex = events.findIndex((event) => event.eventType === "attack_created");
    events.splice(firstAttackIndex, 0, defense);
    expect(validateBattleEventOrder(events).some((issue) => issue.message.includes("defense precedes attack"))).toBe(true);
  });

  it("accepts a partial SSE prefix", () => {
    const events = runDemoBattle().events;
    const prefix = events.slice(0, events.findIndex((event) => event.eventType === "defense_created"));
    expect(validateBattleEventOrder(prefix)).toEqual([]);
  });

  it("detects duplicate IDs and backwards timestamps", () => {
    const events = runDemoBattle().events.slice(0, 2).map((event) => ({ ...event })) as BattleEvent[];
    events[1] = { ...events[1], id: events[0].id, createdAt: "2000-01-01T00:00:00.000Z" };
    const issues = validateBattleEventOrder(events);
    expect(issues.some((issue) => issue.message.includes("duplicate"))).toBe(true);
    expect(issues.some((issue) => issue.message.includes("backwards"))).toBe(true);
  });
});
