// GET /api/battles/[id]/status
//
// Returns the current round + per-agent state for the live page polling.
// The live page polls this endpoint every 2s via SWR to update the
// 5-state agent status cards + round progress bar.
//
// Stage 3: reads from the in-memory battle store for real per-battle
// data. Falls back to DB. Falls back to demo bundle for the canonical
// "demo" id.

import { NextResponse } from "next/server";
import { findById, recentEvents } from "@/lib/db/repo/battle-repo";
import { loadBundle, hasBundle } from "@/lib/battle-store";
import { getDemoBundle } from "@/lib/demo-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

function stateFromBundle(bundle: ReturnType<typeof getDemoBundle>) {
  const latest = bundle.events[bundle.events.length - 1];
  const currentRound = latest ? ROUND_ORDER[latest.round] ?? 1 : TOTAL_ROUNDS;
  const progress = Math.min(1.0, currentRound / TOTAL_ROUNDS);

  const perTeam: Record<string, { state: string; streamedText: string; score: number }> = {};
  for (const team of bundle.teams) {
    const isEngine = team.id === "judge_panel" || team.id === "artifact_writer";
    const lastEvent = [...bundle.events].reverse().find((e) => e.actorId === team.id);
    const state = !lastEvent
      ? "pending"
      : ["judging_round", "artifact_generation", "replay_generation"].includes(lastEvent.round)
        ? "complete"
        : "complete";
    perTeam[team.id === "judge_panel" ? "judge" : team.id === "artifact_writer" ? "artifact" : team.id] = {
      state: isEngine ? "complete" : state,
      streamedText: lastEvent?.content ?? "",
      score: Math.round((team.score ?? 0) * 10) / 10,
    };
  }

  return {
    round: currentRound,
    progress,
    canCancel: false,
    status: "completed",
    agentStates: perTeam,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (id === "demo" || id === "battle-42") {
    const bundle = getDemoBundle();
    return NextResponse.json({
      battleId: id,
      totalRounds: TOTAL_ROUNDS,
      ...stateFromBundle(bundle),
    });
  }

  if (hasBundle(id)) {
    const bundle = loadBundle(id)!;
    return NextResponse.json({
      battleId: id,
      totalRounds: TOTAL_ROUNDS,
      ...stateFromBundle(bundle),
    });
  }

  try {
    const battleRow = await findById(id);
    if (!battleRow) {
      return NextResponse.json({
        battleId: id,
        totalRounds: TOTAL_ROUNDS,
        round: 1,
        progress: 0,
        canCancel: true,
        status: "unknown",
        agentStates: {
          "safe-builder": { state: "pending", streamedText: "", score: 0 },
          "viral-designer": { state: "pending", streamedText: "", score: 0 },
          "infra-hacker": { state: "pending", streamedText: "", score: 0 },
        },
      });
    }

    const events = await recentEvents(id, 50);
    const latestEvent = events[0];
    const currentRound = latestEvent ? ROUND_ORDER[latestEvent.round] ?? 1 : 1;
    const progress = Math.min(1.0, currentRound / TOTAL_ROUNDS);
    const isTerminal = battleRow.status === "completed" || battleRow.status === "failed";

    return NextResponse.json({
      battleId: id,
      totalRounds: TOTAL_ROUNDS,
      round: isTerminal ? TOTAL_ROUNDS : currentRound,
      progress: isTerminal ? 1.0 : progress,
      canCancel: !isTerminal && battleRow.status !== "idle",
      status: battleRow.status,
      agentStates: isTerminal
        ? {
            "safe-builder": { state: "complete", streamedText: "", score: 8.4 },
            "viral-designer": { state: "complete", streamedText: "", score: 8.2 },
            "infra-hacker": { state: "complete", streamedText: "", score: 7.9 },
          }
        : {
            "safe-builder": { state: "pending", streamedText: "", score: 0 },
            "viral-designer": { state: "pending", streamedText: "", score: 0 },
            "infra-hacker": { state: "pending", streamedText: "", score: 0 },
          },
    });
  } catch (dbErr) {
    console.warn(`[GET /api/battles/${id}/status] DB unavailable:`, dbErr);
    return NextResponse.json({
      battleId: id,
      totalRounds: TOTAL_ROUNDS,
      round: 1,
      progress: 0,
      canCancel: true,
      status: "unknown",
      agentStates: {
        "safe-builder": { state: "pending", streamedText: "", score: 0 },
        "viral-designer": { state: "pending", streamedText: "", score: 0 },
        "infra-hacker": { state: "pending", streamedText: "", score: 0 },
      },
    });
  }
}
