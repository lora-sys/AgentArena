import { NextResponse } from "next/server";
import { demoBundle } from "@/lib/demo-data";
import { runBattleFromPayload, summarizeBattleBundle } from "@/lib/battle-api";

export function GET() {
  return NextResponse.json({
    battles: [summarizeBattleBundle(demoBundle)],
  });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const bundle = runBattleFromPayload(payload);

  return NextResponse.json(
    {
      battleId: bundle.battle.id,
      status: bundle.battle.status,
      battle: summarizeBattleBundle(bundle),
      bundle,
    },
    { status: 201 },
  );
}
