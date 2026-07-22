// Repository for the `attack` table (PRD §19 row 6).
import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { attack } from "../schema";

export type NewAttack = typeof attack.$inferInsert;
export type AttackRow = typeof attack.$inferSelect;

export async function insert(input: NewAttack, db = getDb()): Promise<AttackRow> {
  const [row] = await db.insert(attack).values(input).returning();
  if (!row) throw new Error("Failed to insert attack row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<AttackRow[]> {
  return db.select().from(attack).where(eq(attack.battleId, battleId));
}

export async function findByAgent(
  agentId: string,
  db = getDb(),
): Promise<AttackRow[]> {
  return db
    .select()
    .from(attack)
    .where(eq(attack.attackerAgentId, agentId));
}
