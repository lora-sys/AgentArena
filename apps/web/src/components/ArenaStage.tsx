import { demoEvents, teams } from "../data/demo";
import { useArenaState, useBattleReplay } from "./BattleReplayPlayer";

const roundNames: Record<string, string> = {
  proposal_round: "PROPOSAL ROUND",
  cross_attack_round: "ATTACK ROUND",
  defense_round: "DEFENSE ROUND",
  scoring_round: "SCORING ROUND",
  champion_round: "CHAMPION REVEAL",
};

export function ArenaStage({ compact = false, battleId = "demo" }: { compact?: boolean; battleId?: string }) {
  const replay = useBattleReplay(demoEvents);
  const teamIds = teams.map((team) => team.id);
  const { hp, latestByActor } = useArenaState(demoEvents, teamIds, replay.visibleEvents);
  const activeActors = new Set(replay.batch?.events.map((event) => event.actorId));
  const roundTitle = roundNames[replay.batch?.round ?? "proposal_round"];
  return (
    <section className={`arena-stage ${compact ? "compact" : ""}`} aria-label="Live agent battle" data-battle-id={battleId}>
      <header className="arena-header"><div><span className="live-label">LIVE BATTLE</span><strong>AGENT ARENA</strong><small>BATTLE ID · {battleId.toUpperCase()}</small></div><div className="round-meta"><span>ROUND {replay.batchIndex + 1} / {replay.batchCount}</span><b>02:14</b></div></header>
      <div className="round-banner" key={roundTitle}><span>ROUND {replay.batchIndex + 1} / {replay.batchCount}</span><h2>{roundTitle}</h2></div>
      <div className="fighters">
        {teams.map((team) => {
          const event = latestByActor.get(team.id);
          const active = activeActors.has(team.id);
          const hit = replay.batch?.events.some((item) => item.eventType === "defense_created" && item.actorId === team.id);
          return <article key={team.id} className={`fighter ${team.color} ${active ? "active" : ""} ${hit ? "hit" : ""}`}><div className="agent-portrait"><img src={team.portrait} alt={`${team.name} combat portrait`} /></div><div className="fighter-name"><span>{team.name}</span><small>{team.role}</small></div><div className="hp-label"><span>HP</span><b>{hp[team.id] ?? 100}/100</b></div><div className="hp-track"><i style={{ width: `${hp[team.id] ?? 100}%` }} /></div><div className="event-copy"><span>{event?.eventType.replace("_created", "").toUpperCase() ?? "STANDING BY"}</span><p key={event?.id} className={active ? "typing" : ""}>{event?.content ?? "Waiting for the round signal…"}</p><small>{active ? "Typing_" : "Evidence locked"}</small></div></article>;
        })}
      </div>
      <div className="commentary"><b>● LIVE COMMENTARY</b><span>Infra Hacker exposed a critical feasibility flaw in Viral Designer&rsquo;s plan. Evidence sealed.</span></div>
      <div className="replay-controls"><button type="button" onClick={replay.toggle}>{replay.playing ? "PAUSE" : "PLAY"}</button><div><i style={{ width: `${((replay.batchIndex + 1) / replay.batchCount) * 100}%` }} /></div><button type="button" onClick={replay.replay}>REPLAY</button></div>
    </section>
  );
}
