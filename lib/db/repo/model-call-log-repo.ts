// Repository for the `model_call_log` table (PRD §19 row 12).
// Audit trail for every LLM call: provider, model, tokens, latency, cost.
import { eq, desc } from "drizzle-orm";
import { getDb } from "../client";
import { modelCallLog } from "../schema";

export type NewModelCallLog = typeof modelCallLog.$inferInsert;
export type ModelCallLogRow = typeof modelCallLog.$inferSelect;

export async function insert(
  input: NewModelCallLog,
  db = getDb(),
): Promise<ModelCallLogRow> {
  const [row] = await db.insert(modelCallLog).values(input).returning();
  if (!row) throw new Error("Failed to insert model_call_log row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<ModelCallLogRow[]> {
  return db
    .select()
    .from(modelCallLog)
    .where(eq(modelCallLog.battleId, battleId))
    .orderBy(desc(modelCallLog.createdAt));
}
