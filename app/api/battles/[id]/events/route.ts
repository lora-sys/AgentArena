import { NextResponse } from "next/server";
import { getDemoBundle } from "@/lib/demo-data";
import { loadBundle, hasBundle } from "@/lib/battle-store";
import { withRateLimit, validateBattleId, badRequest } from "@/lib/api/guards";

type BattleEventsRouteContext = {
  params: Promise<{ id: string }>;
};

async function getBattleEvents(_request: Request, { params }: BattleEventsRouteContext): Promise<Response> {
  const { id } = await params;

  if (id !== "demo" && !validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

  // 1. Demo shortcut: always return the seeded demo bundle.
  if (id === "demo") {
    const bundle = getDemoBundle();
    return NextResponse.json({ battleId: id, events: bundle.events });
  }

  // 2. Real per-battle: look up the stored bundle.
  if (!hasBundle(id)) {
    // 3. Fallback: return empty events rather than 500.
    return NextResponse.json({ battleId: id, events: [] });
  }

  const bundle = loadBundle(id);
  if (!bundle) return NextResponse.json({ battleId: id, events: [] });
  return NextResponse.json({ battleId: id, events: bundle.events });
}

export const GET = withRateLimit(getBattleEvents);
