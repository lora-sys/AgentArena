// Repository for the `battle_event` table (PRD §13, §19 row 10).
//
// The Battle Engine never touches Drizzle directly — it goes through this
// repo so the engine stays decoupled from the ORM and the test seam
// (pg-mem in tests, Neon/node-postgres in prod) stays in one place.
//
// All functions accept an optional `db` parameter so tests can inject a
// pg-mem-backed Drizzle instance without touching DATABASE_URL. Production
// callers simply omit it and getDb() is used.

import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "../client";
import { battleEvent } from "../schema";

// Row type inferred from the Drizzle table definition. Aliased to avoid
// collision with the domain-level `BattleEvent` from arena/schemas.
export type BattleEventDbRow = typeof battleEvent.$inferSelect;

export type InsertBattleEventInput = {
  battleId: string;
  sequence: number;
  round: string;
  type: string;
  actorType: "system" | "team" | "agent" | "judge";
  actorId?: string | null;
  targetId?: string | null;
  payload: unknown;
};

/**
 * Insert a single battle event. Returns the persisted row (id + createdAt).
 * The DB assigns the uuid via DEFAULT gen_random_uuid().
 */
export async function insert(
  input: InsertBattleEventInput,
  db = getDb(),
): Promise<BattleEventDbRow> {
  const [row] = await db
    .insert(battleEvent)
    .values({
      battleId: input.battleId,
      sequence: input.sequence,
      round: input.round,
      type: input.type,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      targetId: input.targetId ?? null,
      payloadJson: input.payload,
    })
    .returning();
  if (!row) {
    throw new Error("Failed to insert battle_event row");
  }
  return row;
}

/**
 * Return all events for a battle ordered by sequence ASC.
 * Empty array if no events exist for that battle.
 */
export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<BattleEventDbRow[]> {
  return db
    .select()
    .from(battleEvent)
    .where(eq(battleEvent.battleId, battleId))
    .orderBy(asc(battleEvent.sequence));
}

/**
 * Look up a single event by primary key. Returns null if not found.
 */
export async function findById(
  id: string,
  db = getDb(),
): Promise<BattleEventDbRow | null> {
  const [row] = await db.select().from(battleEvent).where(eq(battleEvent.id, id)).limit(1);
  return row ?? null;
}

/**
 * Return the max sequence number for a battle, or 0 if no events exist.
 * Used by the event store to compute monotonic sequence numbers per battle_id.
 */
export async function maxSequence(
  battleId: string,
  db = getDb(),
): Promise<number> {
  const rows = await db
    .select({ max: sql<number>`COALESCE(MAX(${battleEvent.sequence}), 0)` })
    .from(battleEvent)
    .where(eq(battleEvent.battleId, battleId));
  const value = rows[0]?.max;
  return typeof value === "number" ? value : Number(value ?? 0);
}

/**
 * Check whether (battleId, sequence) already exists.
 * Used to surface unique-constraint violations as a typed error
 * instead of a raw Postgres error.
 */
export async function existsBySequence(
  battleId: string,
  sequence: number,
  db = getDb(),
): Promise<boolean> {
  const rows = await db
    .select({ id: battleEvent.id })
    .from(battleEvent)
    .where(and(eq(battleEvent.battleId, battleId), eq(battleEvent.sequence, sequence)))
    .limit(1);
  return rows.length > 0;
}