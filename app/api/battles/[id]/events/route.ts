import { NextResponse } from "next/server";
import { runBattleFromPayload } from "@/lib/battle-api";

type BattleEventsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: BattleEventsRouteContext) {
  const { id } = await params;
  const bundle = runBattleFromPayload({}, id);

  return NextResponse.json({
    battleId: id,
    events: bundle.events,
  });
}
