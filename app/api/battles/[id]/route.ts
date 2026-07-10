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

  // Accept "demo" as a special-case battle id for the demo bundle.
  // Well-formed ids follow btl_<8-char base32>; "demo" is the
  // canonical fixture used by e2e tests and the PRD demo flow.
  if (id !== "demo" && !validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

  const bundle = runBattleFromPayload({}, id);

  return NextResponse.json({
    battle: summarizeBattleBundle(bundle),
    bundle,
  });
}

export const GET = withRateLimit(getBattleHandler);
