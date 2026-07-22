import { NextResponse } from "next/server";
import { runBattleFromPayload, summarizeBattleBundle } from "@/lib/battle-api";
import { loadBundle, hasBundle } from "@/lib/battle-store";
import { getDemoBundle } from "@/lib/demo-data";
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

  // Demo shortcut.
  if (id === "demo") {
    const bundle = getDemoBundle();
    return NextResponse.json({
      battle: summarizeBattleBundle(bundle),
      bundle,
    });
  }

  // Real battle — return the stored bundle if present, else 404.
  if (hasBundle(id)) {
    const bundle = loadBundle(id)!;
    return NextResponse.json({
      battle: summarizeBattleBundle(bundle),
      bundle,
    });
  }

  // Not found — do NOT re-run the engine (CLAUDE.md §13).
  return NextResponse.json(
    { error: `Battle ${id} not found` },
    { status: 404 },
  );
}

export const GET = withRateLimit(getBattleHandler);
