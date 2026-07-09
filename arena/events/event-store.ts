// Postgres-backed event store for AgentArena v0.4 (Issue #4, PRD §13).
//
// The Battle Engine writes every state transition here. Replay and Passport
// views read from here and from nowhere else (CLAUDE.md §7).
//
// Two classes ship from this module:
//
//   - InMemoryBattleEventStore (legacy, synchronous):
//       kept unchanged so existing deterministic demo battle code keeps
//       working. New engine code should use BattleEventStore.
//
//   - BattleEventStore (new, async, Postgres-backed):
//       append(event): validates against Zod, computes monotonic sequence
//         per battle_id, writes to battle_event table, returns id.
//       list(battleId): reads events ordered by sequence ASC.
//       getById(id): single-event lookup.
//
// The public BattleEvent interface from arena/schemas is unchanged; the
// domain shape is preserved across the wire. Payload JSON is stored as-is.

import { getDb } from "../../lib/db/client";
import {
  assertBattleEvent,
  type BattleEvent,
  type BattleEventType,
} from "../schemas";
import {
  existsBySequence,
  findByBattle,
  findById,
  insert as repoInsert,
  maxSequence as repoMaxSequence,
} from "../../lib/db/repo/battle-event-repo";

// ---------------------------------------------------------------------------
// Legacy: in-memory store (kept for backward compat with demo-battle.ts)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Postgres-backed store (new in v0.4)
// ---------------------------------------------------------------------------

/**
 * Convert a DB row to the domain BattleEvent shape.
 * The DB stores payload as jsonb; the domain shape wraps it as rawPayload.
 */
function rowToBattleEvent(row: {
  id: string;
  battleId: string;
  sequence: number;
  round: string;
  type: string;
  actorType: "system" | "team" | "agent" | "judge";
  actorId: string | null;
  targetId: string | null;
  payloadJson: unknown;
  createdAt: Date;
}): BattleEvent {
  return {
    id: row.id,
    battleId: row.battleId,
    round: row.round,
    actorType: row.actorType,
    actorId: row.actorId ?? undefined,
    targetId: row.targetId ?? undefined,
    eventType: row.type as BattleEventType,
    title: "",
    content: "",
    rawPayload: row.payloadJson,
    createdAt: row.createdAt.toISOString(),
  };
}

export class BattleEventStore {
  private readonly db: ReturnType<typeof getDb> | undefined;

  constructor(db?: ReturnType<typeof getDb>) {
    this.db = db;
  }

  /**
   * Validate event against Zod, compute next monotonic sequence for its
   * battle_id, write to battle_event table, return the event id.
   */
  async append(event: BattleEvent): Promise<string> {
    assertBattleEvent(event);

    const nextSeq = (await repoMaxSequence(event.battleId, this.db)) + 1;

    if (await existsBySequence(event.battleId, nextSeq, this.db)) {
      throw new Error(
        `Sequence collision for battle ${event.battleId} at sequence ${nextSeq}. Retry.`,
      );
    }

    const row = await repoInsert(
      {
        battleId: event.battleId,
        sequence: nextSeq,
        round: event.round,
        type: event.eventType,
        actorType: event.actorType,
        actorId: event.actorId ?? null,
        targetId: event.targetId ?? null,
        payload: {
          title: event.title,
          content: event.content,
          rawPayload: event.rawPayload,
        },
      },
      this.db,
    );

    return row.id;
  }

  async list(battleId: string): Promise<BattleEvent[]> {
    const rows = await findByBattle(battleId, this.db);
    return rows.map(rowToBattleEvent);
  }

  async getById(id: string): Promise<BattleEvent | null> {
    const row = await findById(id, this.db);
    return row ? rowToBattleEvent(row) : null;
  }
}
