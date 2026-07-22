// Repository for the `artifact` table (PRD §19 row 9).
import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { artifact } from "../schema";

export type NewArtifact = typeof artifact.$inferInsert;
export type ArtifactRow = typeof artifact.$inferSelect;

export async function insert(input: NewArtifact, db = getDb()): Promise<ArtifactRow> {
  const [row] = await db.insert(artifact).values(input).returning();
  if (!row) throw new Error("Failed to insert artifact row");
  return row;
}

export async function findByBattle(
  battleId: string,
  db = getDb(),
): Promise<ArtifactRow[]> {
  return db.select().from(artifact).where(eq(artifact.battleId, battleId));
}
