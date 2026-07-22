// Repository for the `score` table (PRD §19 row 8).
// Invariant: every score binds to >=1 evidenceEventId (CLAUDE.md §7).
// The CHECK constraint in schema.ts enforces this at the DB layer.
import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { score } from "../schema";

export type NewScore = typeof score.$inferInsert;
export type ScoreRow = typeof score.$inferSelect;

export async function insert(input: NewScore, db = getDb()): Promise<ScoreRow> {
  const [row] = await db.insert(score).values(input).returning();
  if (!row) throw new Error("Failed to insert score row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<ScoreRow[]> {
  return db.select().from(score).where(eq(score.battleId, battleId));
}

export async function findByAgent(
  agentId: string,
  db = getDb(),
): Promise<ScoreRow[]> {
  return db.select().from(score).where(eq(score.agentId, agentId));
}
