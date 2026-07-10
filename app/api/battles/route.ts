import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { demoBundle } from "@/lib/demo-data";
import { summarizeBattleBundle, makeBattleId } from "@/lib/battle-api";
import { getDb } from "@/lib/db/client";
import { battle } from "@/lib/db/schema";

export function GET() {
  return NextResponse.json({
    battles: [summarizeBattleBundle(demoBundle)],
  });
}

/* ------------------------------------------------------------------ */
/* POST /api/battles — create a new battle                            */
/* ------------------------------------------------------------------ */

// Request body schema: { idea: string (10-2000 chars), mode?: "quick" | "full" }
const CreateBattleBodySchema = z.object({
  idea: z
    .string()
    .min(10, "idea must be at least 10 characters")
    .max(2000, "idea must be at most 2000 characters"),
  mode: z.enum(["quick", "full"]).optional().default("full"),
});

export async function POST(request: Request) {
  // TODO(be): rate-limit per IP — separate ticket (B5). Logged here for visibility.
  console.log("[POST /api/battles] rate-limit check skipped (TODO B5)");

  // 1. Parse and validate body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = CreateBattleBodySchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    return NextResponse.json(
      { error: "Validation failed", issues },
      { status: 400 },
    );
  }

  const { idea, mode } = parsed.data;

  // 2. Generate deterministic battle_id from idea (PRD §8: btl_<8-char base32>)
  const battleId = makeBattleId(idea);

  // 3. Idempotency: if a battle with this exact idea already exists, return it.
  try {
    const db = getDb();
    const existing = await db
      .select({ id: battle.id })
      .from(battle)
      .where(eq(battle.idea, idea))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { battleId: existing[0].id, status: "created" },
        { status: 200 },
      );
    }
  } catch (dbErr) {
    // DB not available (tests, build time, missing DATABASE_URL).
    // For Sprint 0 demo, fall through to returning the in-memory battle_id.
    console.warn("[POST /api/battles] DB unavailable, skipping idempotency check:", dbErr);
  }

  // 4. Persist the new battle row.
  try {
    const db = getDb();
    const settingsJson = { mode };
    const originalInput = { idea, mode };

    await db.insert(battle).values({
      id: battleId,
      title: idea.slice(0, 100),
      idea,
      type: "hackathon",
      status: "idle",
      originalInput,
      settingsJson,
      mode,
    });
  } catch (dbErr) {
    // DB write failed — log but still return the battle_id so the client
    // can proceed (Sprint 0 demo: engine runs in-memory from battle-api.ts).
    console.warn("[POST /api/battles] DB insert failed, returning in-memory id:", dbErr);
  }

  // 5. Return the created battle_id.
  //    Also include `battle.id` for backward compatibility with the existing
  //    setup form which reads `data.battle?.id`.
  return NextResponse.json(
    {
      battleId,
      status: "created",
      battle: { id: battleId },
    },
    { status: 201 },
  );
}