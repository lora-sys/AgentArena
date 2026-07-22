import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { runBattleFromPayload, summarizeBattleBundle, makeBattleId } from "@/lib/battle-api";
import { getDemoBundle } from "@/lib/demo-data";
import { storeBundle } from "@/lib/battle-store";
import { getDb } from "@/lib/db/client";
import { battle } from "@/lib/db/schema";
import { withRateLimit } from "@/lib/api/guards";

export function GET() {
  const demo = summarizeBattleBundle(getDemoBundle());
  return NextResponse.json({
    battles: [demo],
  });
}

const CreateBattleBodySchema = z.object({
  idea: z
    .string()
    .trim()
    .min(10, "idea must be at least 10 characters")
    .max(2000, "idea must be at most 2000 characters"),
  mode: z.enum(["quick", "full"]).optional().default("full"),
});

async function createBattleHandler(request: Request): Promise<Response> {
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

  const battleId = makeBattleId(idea);

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
    console.warn("[POST /api/battles] DB unavailable, skipping idempotency check:", dbErr);
  }

  const bundle = await runBattleFromPayload({ idea }, battleId, mode);
  storeBundle(battleId, bundle);

  try {
    const db = getDb();
    await db.insert(battle).values({
      id: battleId,
      title: idea.slice(0, 100),
      idea,
      type: "hackathon",
      status: bundle.battle.status,
      originalInput: { idea, mode },
      settingsJson: { mode },
      mode,
    });
  } catch (dbErr) {
    const isUniqueViolation =
      dbErr instanceof Error &&
      /unique|duplicate/i.test(dbErr.message);

    if (isUniqueViolation) {
      try {
        const db = getDb();
        const winner = await db
          .select({ id: battle.id })
          .from(battle)
          .where(eq(battle.idea, idea))
          .limit(1);
        if (winner.length > 0) {
          return NextResponse.json(
            { battleId: winner[0].id, status: "created" },
            { status: 200 },
          );
        }
      } catch {
        // fall through to inMemory below
      }
    }

    console.warn("[POST /api/battles] DB insert failed, falling through to in-memory:", dbErr);
    return NextResponse.json(
      {
        battleId,
        status: "created",
        inMemory: true,
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    {
      battleId,
      status: "created",
    },
    { status: 201 },
  );
}

export const POST = withRateLimit(createBattleHandler);
