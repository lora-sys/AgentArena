import { NextResponse } from "next/server";
import { withRateLimit, validateBattleId, badRequest, cancelCurrentBattle } from "@/lib/api/guards";

type CancelRouteContext = {
  params: Promise<{ id: string }>;
};

async function cancelBattleHandler(
  _request: Request,
  ctx: CancelRouteContext,
): Promise<Response> {
  const { id } = await ctx.params;

  if (!validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

  const cancelled = cancelCurrentBattle(id);

  return NextResponse.json({
    battleId: id,
    cancelled,
    status: cancelled ? "cancelling" : "not_running",
  });
}

export const POST = withRateLimit(cancelBattleHandler);
