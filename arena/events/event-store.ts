// In-memory event store for AgentArena. Pure client/server-safe — no
// Postgres, no drizzle, no Node-only modules. Used by deterministic engine
// and any code that needs an in-process event buffer (tests, fixtures).
//
// The Postgres-backed implementation lives in event-store-postgres.ts.

import { assertBattleEvent, type BattleEvent, type BattleEventType } from "../schemas";

const cloneEvent = (event: BattleEvent): BattleEvent => ({ ...event });

export class InMemoryBattleEventStore {
  private readonly events: BattleEvent[] = [];

  append(event: BattleEvent): BattleEvent {
    assertBattleEvent(event);
    const storedEvent = cloneEvent(event);
    this.events.push(storedEvent);
    return cloneEvent(storedEvent);
  }

  appendBatch(events: BattleEvent[]): BattleEvent[] {
    return events.map((event) => this.append(event));
  }

  list(battleId?: string): BattleEvent[] {
    const events =
      battleId === undefined
        ? this.events
        : this.events.filter((event) => event.battleId === battleId);
    return events.map(cloneEvent);
  }

  listByType(eventType: BattleEventType, battleId?: string): BattleEvent[] {
    return this.list(battleId).filter((event) => event.eventType === eventType);
  }

  latest(battleId?: string): BattleEvent | undefined {
    const events = this.list(battleId);
    const event = events[events.length - 1];
    return event === undefined ? undefined : cloneEvent(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}
