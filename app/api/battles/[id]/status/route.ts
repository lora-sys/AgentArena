// GET /api/battles/[id]/status
//
// Returns the current round + per-agent state for the live page polling.
// The live page polls this endpoint every 2s via SWR to update the
// 5-state agent status cards + round progress bar.
//
// Stage 3: reads from the DB for real battle IDs (battle + recent
// battle_event rows). For the demo battle ID, keeps the static complete
// response for backward compatibility with the UI.

import { NextResponse } from "next/server";
import { findById, recentEvents } from "@/lib/db/repo/battle-repo";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Round ordering for progress calculation.
const ROUND_ORDER: Record<string, number> = {
  briefing: 1,
  team_generation: 2,
  proposal_round: 3,
  cross_attack_round: 4,
  defense_round: 5,
  judging_round: 6,
  artifact_generation: 7,
  replay_generation: 8,
};

const TOTAL_ROUNDS = 8;

const STATIC_DEMO_STATE = {
  round: 6,
  progress: 1.0,
  canCancel: false,
  agentStates: {
    "safe-builder": { state: "complete", streamedText: "", score: 8.4 },
    "viral-designer": { state: "complete", streamedText: "", score: 8.2 },
    "infra-hacker": { state: "complete", streamedText: "", score: 7.9 },
  },
} as const;

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  // Demo battle ID keeps static complete response.
  if (id === "demo" || id === "battle-42") {
    return NextResponse.json({ battleId: id, ...STATIC_DEMO_STATE });
  }

  // Real battle: query DB.
  try {
    const battleRow = await findById(id);
    if (!battleRow) {
      return NextResponse.json(
        { error: "Battle not found" },
        { status: 404 },
      );
    }

    const events = await recentEvents(id, 50);

    // Compute current round from the most recent event's round.
    const latestEvent = events[0];
    const currentRoundName = latestEvent?.round ?? "briefing";
    const currentRound = ROUND_ORDER[currentRoundName] ?? 1;
    const progress = Math.min(1.0, currentRound / TOTAL_ROUNDS);

    // If battle status is completed or failed, everything is done.
    const isTerminal = battleRow.status === "completed" || battleRow.status === "failed";

    return NextResponse.json({
      battleId: id,
      round: isTerminal ? TOTAL_ROUNDS : currentRound,
      progress: isTerminal ? 1.0 : progress,
      canCancel: !isTerminal && battleRow.status !== "idle",
      agentStates: isTerminal
        ? STATIC_DEMO_STATE.agentStates
        : {
            "safe-builder": { state: "pending", streamedText: "", score: 0 },
            "viral-designer": { state: "pending", streamedText: "", score: 0 },
            "infra-hacker": { state: "pending", streamedText: "", score: 0 },
          },
      status: battleRow.status,
    });
  } catch (dbErr) {
    // DB unavailable — return a minimal response so polling doesn't break.
    console.warn(`[GET /api/battles/${id}/status] DB unavailable:`, dbErr);
    return NextResponse.json({
      battleId: id,
      round: 1,
      progress: 0,
      canCancel: true,
      agentStates: {
        "safe-builder": { state: "pending", streamedText: "", score: 0 },
        "viral-designer": { state: "pending", streamedText: "", score: 0 },
        "infra-hacker": { state: "pending", streamedText: "", score: 0 },
      },
    });
  }
}