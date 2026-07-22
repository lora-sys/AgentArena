import { NextResponse } from "next/server";
import { loadBundle, hasBundle } from "@/lib/battle-store";

// Map engine IDs to UI team metadata for subtitle display
const teamMeta: Record<string, { subtitle: string }> = {
  safe_builder: { subtitle: "Feasibility First" },
  viral_designer: { subtitle: "Make It Memorable" },
  infra_hacker: { subtitle: "Tech Depth First" },
  judge_panel: { subtitle: "Rubric Judge" },
  artifact_writer: { subtitle: "Artifact Finisher" },
};

type AgentPassport = {
  id: string;
  agentId: string;
  battleId: string;
  agentName: string;
  role: string;
  version: string;
  directoryPath: string;
  contributionSummary: string;
  acceptedClaims: Array<{
    claim: string;
    attackId: string;
    defenseId: string;
    acceptedAttack: boolean;
    attackerTeamId: string;
    defenderTeamId: string;
  }>;
  rejectedClaims: Array<{
    claim: string;
    attackId: string;
    defenseId: string;
    acceptedAttack: boolean;
    attackerTeamId: string;
    defenderTeamId: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  contributionScore: number;
};

type BattleSummary = {
  id: string;
  title: string;
  winnerTeamId?: string;
  winnerName?: string;
  winnerScore?: number;
};

type BundleResponse = {
  battle: BattleSummary;
  bundle: {
    passports: AgentPassport[];
  };
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const engineId = id.replace(/-/g, "_");

  // 1. Try the in-memory battle store first (event store for Sprint 2).
  //    "demo" is a virtual battle ID — fall through to the seeded bundle.
  if (id !== "demo" && hasBundle(id)) {
    const bundle = loadBundle(id);
    if (bundle) {
      const teamEntry = bundle.teams.find(
        (t) => t.id === engineId,
      );

      if (!teamEntry && id !== "demo") {
        return NextResponse.json(
          { battle: { id: id, title: "Battle" }, bundle: { passports: [] } },
          { status: 200 },
        );
      }

      const agentName = teamEntry?.name ?? "Unknown Agent";
      const role = teamMeta[engineId]?.subtitle ?? teamEntry?.strategy ?? "";

      const passport = bundle.passports.find(
        (p) => p.agentId.startsWith(engineId),
      );
      const scores = bundle.scores.find((s) => s.teamId === engineId);

      const passportData: AgentPassport = {
        id: `passport_${id}_${id}`,
        agentId: `${engineId}_agent`,
        battleId: id,
        agentName,
        role,
        version: "v1",
        directoryPath: `agents/${id}`,
        contributionSummary: `${agentName} contributed ${passport?.acceptedClaims.length ?? 0} accepted claims and ${passport?.rejectedClaims.length ?? 0} rejected claims across ${bundle.events.length} events.`,
        acceptedClaims: (passport?.acceptedClaims ?? []).map((claim) => ({
          claim: claim.claim,
          attackId: claim.attackId,
          defenseId: claim.defenseId,
          acceptedAttack: claim.acceptedAttack,
          attackerTeamId: claim.attackerTeamId,
          defenderTeamId: claim.defenderTeamId,
        })),
        rejectedClaims: (passport?.rejectedClaims ?? []).map((claim) => ({
          claim: claim.claim,
          attackId: claim.attackId,
          defenseId: claim.defenseId,
          acceptedAttack: claim.acceptedAttack,
          attackerTeamId: claim.attackerTeamId,
          defenderTeamId: claim.defenderTeamId,
        })),
        strengths: passport?.strengths ?? [],
        weaknesses: passport?.weaknesses ?? [],
        contributionScore: scores ? Math.round(scores.totalScore * 100) : 0,
      };

      const battle: BattleSummary = {
        id: bundle.battle.id,
        title: bundle.battle.title,
        winnerTeamId: bundle.battle.winnerTeamId,
        winnerName: teamEntry?.name,
        winnerScore: scores?.totalScore,
      };

      return NextResponse.json({
        battle,
        bundle: { passports: [passportData] },
      });
    }
  }

  // 2. Fallback: return empty for unknown agents (never expose demo data for
  //    arbitrary agent IDs — CL v13 requires the id to be validated).
  return NextResponse.json(
    { battle: { id: id, title: "Battle" }, bundle: { passports: [] } },
    { status: 200 },
  );
}
