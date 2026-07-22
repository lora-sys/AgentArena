// Repository for the `passport_snapshot` table (PRD §19 row 11).
import { and, eq } from "drizzle-orm";
import { getDb } from "../client";
import { passportSnapshot } from "../schema";

export type NewPassportSnapshot = typeof passportSnapshot.$inferInsert;
export type PassportSnapshotRow = typeof passportSnapshot.$inferSelect;

export async function insert(
  input: NewPassportSnapshot,
  db = getDb(),
): Promise<PassportSnapshotRow> {
  const [row] = await db.insert(passportSnapshot).values(input).returning();
  if (!row) throw new Error("Failed to insert passport_snapshot row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<PassportSnapshotRow[]> {
  return db
    .select()
    .from(passportSnapshot)
    .where(eq(passportSnapshot.battleId, battleId));
}

export async function findByAgent(
  battleId: string,
  agentId: string,
  db = getDb(),
): Promise<PassportSnapshotRow | null> {
  const [row] = await db
    .select()
    .from(passportSnapshot)
    .where(and(eq(passportSnapshot.battleId, battleId), eq(passportSnapshot.agentId, agentId)))
    .limit(1);
  return row ?? null;
}
