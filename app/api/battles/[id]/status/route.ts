// GET /api/battles/[id]/status
//
// Returns the current round + per-agent state for the live page polling.
// The live page polls this endpoint every 2s via SWR to update the
// 5-state agent status cards + round progress bar.
//
// For Sprint 2 stage 2 MVP, this endpoint returns static state for the
// demo battle (all agents complete). Real per-agent state machine
// wiring happens in stage 3 (Postgres persistence + event broadcaster).

import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  // MVP: all agents complete for demo. Real state machine: stage 3.
  return NextResponse.json({
    battleId: id,
    round: 6,
    progress: 1.0,
    canCancel: false,
    agentStates: {
      "safe-builder": {
        state: "complete",
        streamedText: "",
        score: 8.4,
      },
      "viral-designer": {
        state: "complete",
        streamedText: "",
        score: 8.2,
      },
      "infra-hacker": {
        state: "complete",
        streamedText: "",
        score: 7.9,
      },
    },
  });
}
