// Repository for the `battle` table.
//
// Like battle-event-repo.ts, this isolates Drizzle access so the engine and
// route handlers don't depend on the ORM directly. All functions accept an
// optional `db` parameter so tests can inject a pg-mem-backed Drizzle instance.

import { eq, desc } from "drizzle-orm";
import { getDb } from "../client";
import { battle, battleEvent } from "../schema";
import type { NewBattle } from "../schema";

// Row type inferred from the Drizzle table definition.
export type BattleDbRow = typeof battle.$inferSelect;

/**
 * Insert a battle row. Returns the persisted row.
 * Idempotency is handled by the unique index on `idea` — a second insert
 * with the same idea will throw a unique-constraint violation that the
 * caller can catch and recover from.
 */
export async function insert(
  input: NewBattle,
  db = getDb(),
): Promise<BattleDbRow> {
  const [row] = await db
    .insert(battle)
    .values(input)
    .returning();
  if (!row) {
    throw new Error("Failed to insert battle row");
  }
  return row;
}

/**
 * Look up a battle by its primary key. Returns null if not found.
 */
export async function findById(
  id: string,
  db = getDb(),
): Promise<BattleDbRow | null> {
  const [row] = await db.select().from(battle).where(eq(battle.id, id)).limit(1);
  return row ?? null;
}

/**
 * Return the most recent N events for a battle, ordered by sequence DESC.
 * Used by the status route to compute current state without loading the full
 * event log.
 */
export async function recentEvents(
  battleId: string,
  limit = 50,
  db = getDb(),
): Promise<Array<typeof battleEvent.$inferSelect>> {
  return db
    .select()
    .from(battleEvent)
    .where(eq(battleEvent.battleId, battleId))
    .orderBy(desc(battleEvent.sequence))
    .limit(limit);
}