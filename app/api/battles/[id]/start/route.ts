import { NextResponse } from "next/server";
import { runBattleFromPayload, summarizeBattleBundle } from "@/lib/battle-api";

type StartBattleRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: StartBattleRouteContext) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const bundle = runBattleFromPayload(payload, id);

  return NextResponse.json({
    battleId: bundle.battle.id,
    status: bundle.battle.status,
    battle: summarizeBattleBundle(bundle),
    bundle,
  });
}
