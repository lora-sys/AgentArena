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

  // R22 fix: only the explicit demo battle is "demo_not_cancellable" (it
  // runs synchronously and finishes before cancel can reach it). Real AI
  // battles use the abort controller and can be cancelled; if no
  // controller is registered, return "not_running" so the client can
  // distinguish a real-but-finished battle from an already-finished demo.
  const status = cancelled
    ? "cancelling"
    : id === "demo"
      ? "demo_not_cancellable"
      : "not_running";

  return NextResponse.json({
    battleId: id,
    cancelled,
    status,
  });
}

export const POST = withRateLimit(cancelBattleHandler);
