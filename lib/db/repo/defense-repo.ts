// Repository for the `defense` table (PRD §19 row 7).
import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { defense } from "../schema";

export type NewDefense = typeof defense.$inferInsert;
export type DefenseRow = typeof defense.$inferSelect;

export async function insert(input: NewDefense, db = getDb()): Promise<DefenseRow> {
  const [row] = await db.insert(defense).values(input).returning();
  if (!row) throw new Error("Failed to insert defense row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<DefenseRow[]> {
  return db.select().from(defense).where(eq(defense.battleId, battleId));
}

export async function findByAgent(
  agentId: string,
  db = getDb(),
): Promise<DefenseRow[]> {
  return db.select().from(defense).where(eq(defense.agentId, agentId));
}
