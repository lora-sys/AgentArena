import { Navigate, useParams } from "react-router-dom";
import { verifiedShowcaseEvents, verifiedShowcasePassport, verifiedShowcaseStandings, VERIFIED_SHOWCASE_ID } from "../data/verified-showcase";
import { ChampionReveal } from "./champion-reveal";
import { TeamPassport } from "./team-passport";
import styles from "./champion-page.module.css";

export function ChampionPage() {
  const { battleId = VERIFIED_SHOWCASE_ID } = useParams();
  if (battleId !== VERIFIED_SHOWCASE_ID) return <Navigate to={`/battle/${battleId}`} replace />;
  const champion = verifiedShowcaseEvents().find((event) => event.eventType === "champion_selected");
  if (!champion) return <Navigate to={`/battle/${battleId}?mode=verified_replay`} replace />;
  return <main className={styles.page} data-battle-id={battleId}>
    <ChampionReveal battleId={battleId} timestamp={champion.createdAt} passport={verifiedShowcasePassport} standings={verifiedShowcaseStandings} />
    <TeamPassport battleId={battleId} passport={verifiedShowcasePassport} />
  </main>;
}
