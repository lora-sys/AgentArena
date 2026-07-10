import { NextResponse } from "next/server";
import { runBattleFromPayload, summarizeBattleBundle } from "@/lib/battle-api";
import { withRateLimit, validateBattleId, badRequest } from "@/lib/api/guards";

type BattleRouteContext = {
  params: Promise<{ id: string }>;
};

async function getBattleHandler(
  _request: Request,
  { params }: BattleRouteContext,
): Promise<Response> {
  const { id } = await params;

  if (!validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

  const bundle = runBattleFromPayload({}, id);

  return NextResponse.json({
    battle: summarizeBattleBundle(bundle),
    bundle,
  });
}

export const GET = withRateLimit(getBattleHandler);
