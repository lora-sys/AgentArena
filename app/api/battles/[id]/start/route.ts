import { NextResponse } from "next/server";
import { z } from "zod";
import { runBattleFromPayload, summarizeBattleBundle } from "@/lib/battle-api";
import { withRateLimit, withGlobalConcurrency, withInputValidation, badRequest, validateBattleId, validateIdea, registerAbortController, clearAbortController } from "@/lib/api/guards";

type StartBattleRouteContext = {
  params: Promise<{ id: string }>;
};

const StartBattleSchema = z.object({
  idea: z.string(),
});

async function startBattleHandler(
  data: z.infer<typeof StartBattleSchema>,
  _request: Request,
  ctx: StartBattleRouteContext,
): Promise<Response> {
  const { id } = await ctx.params;

  if (!validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

  const ideaResult = validateIdea(data.idea);
  if (!ideaResult.ok) {
    return badRequest(ideaResult.error);
  }

  // Register an AbortController for this battle so the cancel endpoint
  // can signal in-flight operations. Cleanup runs in finally to prevent
  // unbounded growth of the registry map.
  registerAbortController(id);

  try {
    const bundle = runBattleFromPayload({ idea: ideaResult.value }, id);

    return NextResponse.json({
      battleId: bundle.battle.id,
      status: bundle.battle.status,
      battle: summarizeBattleBundle(bundle),
      bundle,
    });
  } finally {
    clearAbortController(id);
  }
}

export const POST = withRateLimit(
  withGlobalConcurrency(
    withInputValidation(StartBattleSchema, async (data, _request, ctx) => {
      if (ctx && typeof ctx === "object" && "params" in ctx) {
        return startBattleHandler(data, _request, ctx as StartBattleRouteContext);
      }
      return badRequest("Missing route context");
    }),
  ),
);
