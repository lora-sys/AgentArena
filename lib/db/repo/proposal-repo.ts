// Repository for the `proposal` table (PRD §19 row 5).
import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { proposal } from "../schema";

export type NewProposal = typeof proposal.$inferInsert;
export type ProposalRow = typeof proposal.$inferSelect;

export async function insert(input: NewProposal, db = getDb()): Promise<ProposalRow> {
  const [row] = await db.insert(proposal).values(input).returning();
  if (!row) throw new Error("Failed to insert proposal row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<ProposalRow[]> {
  return db.select().from(proposal).where(eq(proposal.battleId, battleId));
}

export async function findById(
  id: string,
  db = getDb(),
): Promise<ProposalRow | null> {
  const [row] = await db.select().from(proposal).where(eq(proposal.id, id)).limit(1);
  return row ?? null;
}
