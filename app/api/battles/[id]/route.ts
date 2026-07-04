import { NextResponse } from "next/server";
import { runBattleFromPayload, summarizeBattleBundle } from "@/lib/battle-api";

type BattleRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: BattleRouteContext) {
  const { id } = await params;
  const bundle = runBattleFromPayload({}, id);

  return NextResponse.json({
    battle: summarizeBattleBundle(bundle),
    bundle,
  });
}
