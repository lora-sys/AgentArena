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
    console.error("[GET /api/battles/:id/events] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const GET = withRateLimit(getBattleEvents);
