import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { verifiedShowcaseEvents, verifiedShowcasePassport, verifiedShowcaseStandings, VERIFIED_SHOWCASE_ID } from "../data/verified-showcase";
import { ChampionReveal } from "./champion-reveal";
import { TeamPassport } from "./team-passport";
import styles from "./champion-page.module.css";
import { MiniPassportCard } from "./mini-passport-card";
import { loadBattleEvents, type BattleEventsResult } from "../data/battle";
import { normalizeMode } from "./runtime-mode-badge";

export function ChampionPage() {
  const { battleId = VERIFIED_SHOWCASE_ID } = useParams();
  const [searchParams] = useSearchParams();
  if (battleId !== VERIFIED_SHOWCASE_ID) {
    if (normalizeMode(searchParams.get("mode")) !== "live_runtime") return <Navigate to={`/battle/${battleId}`} replace />;
    return <LiveChampionGate battleId={battleId} />;
  }
  const champion = verifiedShowcaseEvents().find((event) => event.eventType === "champion_selected");
  if (!champion) return <Navigate to={`/battle/${battleId}?mode=verified_replay`} replace />;
  return <main className={styles.page} data-battle-id={battleId}>
    <ChampionReveal battleId={battleId} timestamp={champion.createdAt} passport={verifiedShowcasePassport} standings={verifiedShowcaseStandings} />
    <TeamPassport battleId={battleId} passport={verifiedShowcasePassport} />
  </main>;
}

function LiveChampionGate({ battleId }: { battleId: string }) {
  const [battle, setBattle] = useState<BattleEventsResult | null>(null);
  useEffect(() => {
    let current = true;
    void loadBattleEvents(battleId).then((result) => { if (current) setBattle(result); });
    return () => { current = false; };
  }, [battleId]);
  if (!battle) return <MiniPassportCard battleId={battleId} />;
  const judgingCompleted = battle.source === "event-store" && battle.events.some((event) => event.eventType === "champion_selected");
  if (judgingCompleted) return <Navigate to={`/battle/${battleId}?mode=live_runtime&view=result`} replace />;
  return <MiniPassportCard battleId={battleId} hasRecordedEvents={battle.source === "event-store" && battle.events.length > 0} />;
}
