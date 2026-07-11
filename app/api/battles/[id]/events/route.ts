import { NextResponse } from "next/server";
import { runBattleFromPayload } from "@/lib/battle-api";
import { withRateLimit, validateBattleId } from "@/lib/api/guards";

type BattleEventsRouteContext = {
  params: Promise<{ id: string }>;
};

async function getBattleEvents(_request: Request, { params }: BattleEventsRouteContext): Promise<Response> {
  const { id } = await params;

  if (!validateBattleId(id)) {
    return NextResponse.json(
      { error: "Invalid battle ID format" },
      { status: 400 },
    );
  }

  try {
    const bundle = runBattleFromPayload({}, id);
    return NextResponse.json({
      battleId: id,
      events: bundle.events,
    });
  } catch (err) {
    // R26 fix: never 500 for a valid-format battle ID. Even if the demo
    // engine throws (shouldn't happen, but for safety), return an empty
    // events array so the client contract holds. POST /api/battles may
    // create in-memory battles (inMemory: true) and the client polls this
    // route — a 500 here would break that flow.
    console.error("[GET /api/battles/:id/events] Unexpected error:", err);
    return NextResponse.json({
      battleId: id,
      events: [],
    });
  }
}

export const GET = withRateLimit(getBattleEvents);
