import type { BattleEvent } from "@agent-arena/contracts";
import { demoEvents, teams } from "../data/demo";
import { useArenaState, useBattleReplay } from "./BattleReplayPlayer";
import { useEffect } from "react";

const roundNames: Record<string, string> = {
  proposal_round: "PROPOSAL ROUND",
  cross_attack_round: "ATTACK ROUND",
  defense_round: "DEFENSE ROUND",
  scoring_round: "SCORING ROUND",
  champion_round: "CHAMPION REVEAL",
};

export function ArenaStage({ compact = false, battleId = "demo", events = demoEvents, onProgress }: { compact?: boolean; battleId?: string; events?: readonly BattleEvent[]; onProgress?: (events: readonly BattleEvent[]) => void }) {
  const replay = useBattleReplay(events);
  const teamIds = teams.map((team) => team.id);
  const { hp, latestByActor } = useArenaState(events, teamIds, replay.visibleEvents);
  useEffect(() => onProgress?.(replay.visibleEvents), [onProgress, replay.visibleEvents]);
  const activeActors = new Set(replay.batch?.events.map((event) => event.actorId));
  const roundTitle = replay.batch?.events.some((event) => event.eventType === "champion_selected")
    ? "CHAMPION REVEAL"
    : replay.batch?.events.some((event) => event.eventType === "score_created")
      ? "SCORING ROUND"
      : roundNames[replay.batch?.round ?? "proposal_round"];
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
      <div className="commentary"><b>● LIVE COMMENTARY</b><span>{commentaryFor(replay.batch?.events ?? [])}</span></div>
      <div className="replay-controls"><button type="button" onClick={replay.toggle}>{replay.playing ? "PAUSE" : "PLAY"}</button><div><i style={{ width: `${((replay.batchIndex + 1) / replay.batchCount) * 100}%` }} /></div><button type="button" onClick={replay.replay}>REPLAY</button></div>
    </section>
  );
}

function commentaryFor(events: readonly BattleEvent[]) {
  const event = events[events.length - 1];
  if (!event) return "Arena systems standing by.";
  if (event.eventType === "proposal_created") return "Three teams are writing at once. Every claim will become replayable evidence.";
  if (event.eventType === "attack_created") return `${event.title}. The target now has to answer the evidence.`;
  if (event.eventType === "defense_created") return event.content;
  if (event.eventType === "score_created") return "Judges are binding scores to the recorded evidence chain.";
  if (event.eventType === "champion_selected") return `${event.title}. Reputation updated from battle evidence.`;
  return event.content;
}
