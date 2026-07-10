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
    // Demo battles run synchronously and complete before any cancel can
    // reach them. Return a distinct status so the client can show feedback
    // instead of silently no-oping. Real AI battles will return "cancelling".
    status: cancelled ? "cancelling" : "demo_not_cancellable",
  });
}

export const POST = withRateLimit(cancelBattleHandler);
