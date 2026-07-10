// Postgres-backed event store for AgentArena v0.4 (Issue #4, PRD §13).
//
// SERVER-ONLY. Imports pg + drizzle. Must NEVER be imported from client
// components. Use InMemoryBattleEventStore (from event-store.ts) instead
// when an in-process store is acceptable.

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
