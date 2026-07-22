import type { BattleEvent } from "@agent-arena/contracts";
import { demoEvents } from "./demo";

export type BattleEventsResult = {
  source: "event-store" | "fixture" | "fallback";
  events: BattleEvent[];
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, "ok" | "json">>;

export async function loadBattleEvents(battleId: string, fetcher: FetchLike = fetch): Promise<BattleEventsResult> {
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

