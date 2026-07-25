import type { BattleEvent } from "@agent-arena/contracts";
import { demoEvents } from "./demo";
import { VERIFIED_SHOWCASE_ID, verifiedShowcaseEvents } from "./verified-showcase";

export type BattleEventsResult = {
  source: "event-store" | "fixture" | "fallback";
  events: BattleEvent[];
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, "ok" | "json">>;

export async function loadBattleEvents(battleId: string, fetcher: FetchLike = fetch): Promise<BattleEventsResult> {
  if (battleId === VERIFIED_SHOWCASE_ID) {
    return { source: "fixture", events: verifiedShowcaseEvents() };
  }
  try {
    const response = await fetcher(`/api/battles/${encodeURIComponent(battleId)}/events`);
    if (!response.ok) throw new Error("Battle event request failed");
    const result = await response.json() as BattleEventsResult;
    if (!Array.isArray(result.events) || result.events.length === 0) throw new Error("No replayable events");
    return result;
  } catch {
    return { source: "fallback", events: demoEvents };
  }
}

export type BattleArchiveItem = { id: string; title: string; idea: string; status: string; winnerName: string; agents: string[]; eventCount: number; updatedAt: string };
export function buildDashboardMetrics(battles: readonly BattleArchiveItem[]) {
  const completed = battles.filter((battle) => battle.status === "completed").length;
  return {
    totalBattles: battles.length,
    completedRate: battles.length ? Math.round((completed / battles.length) * 100) : 0,
    evidenceEvents: battles.reduce((total, battle) => total + battle.eventCount, 0),
    agentsTested: new Set(battles.flatMap((battle) => battle.agents)).size,
    series: battles.map((battle, index) => ({ label: `B${index + 1}`, evidence: battle.eventCount, completion: battle.status === "completed" ? 100 : 45 })),
  };
}
export type PassportData = {
  agentId: string; agentName: string; role: string; contributionSummary: string; reputation: number;
  strengths: string[]; weaknesses: string[]; acceptedCount: number; rejectedCount: number;
  evidence: Array<{ eventId: string; claim: string; accepted: boolean; attackId: string; defenseId: string }>;
  trend: Array<{ label: string; value: number }>;
  battles: Array<{ id: string; title: string; result: string; date: string }>;
};

export async function loadBattleArchive(fetcher: FetchLike = fetch): Promise<BattleArchiveItem[]> {
  const response = await fetcher("/api/battles");
  if (!response.ok) throw new Error("Archive request failed");
  return ((await response.json()) as { battles: BattleArchiveItem[] }).battles;
}

export async function loadPassport(agentId: string, fetcher: FetchLike = fetch): Promise<PassportData> {
  const response = await fetcher(`/api/agents/${encodeURIComponent(agentId)}/passport`);
  if (!response.ok) throw new Error("Passport request failed");
  return ((await response.json()) as { passport: PassportData }).passport;
}
