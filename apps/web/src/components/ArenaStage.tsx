import { type BattleEvent, type Severity } from "@agent-arena/contracts";
import { demoEvents, teams } from "../data/demo";
import { useArenaState, useBattleReplay } from "./BattleReplayPlayer";
import { TypewriterText } from "./typewriter-text";
import { RoundBanner } from "./round-banner";
import { ArenaHost } from "./arena-host";
import { HpBar } from "./hp-bar";
import { useEffect, useRef } from "react";

export function ArenaStage({ compact = false, battleId = "demo", events = demoEvents, onProgress }: { compact?: boolean; battleId?: string; events?: readonly BattleEvent[]; onProgress?: (events: readonly BattleEvent[]) => void }) {
  const replay = useBattleReplay(events);
  const teamIds = teams.map((team) => team.id);
  const { hp, latestByActor } = useArenaState(events, teamIds, replay.visibleEvents);
  useEffect(() => onProgress?.(replay.visibleEvents), [onProgress, replay.visibleEvents]);
  // 追踪上一帧 committed HP，供 HpBar 计算掉血量 / 触发动画
  const prevHpRef = useRef<Record<string, number>>({});
  const prevHp = prevHpRef.current;
  useEffect(() => { prevHpRef.current = hp; }, [hp]);
  const activeActors = new Set(replay.batch?.events.map((event) => event.actorId));
  // 展示层回合 key：优先识别冠军 / 评分事件，否则用 batch 的 Engine 回合
  const effectiveRound = replay.batch?.events.some((event) => event.eventType === "champion_selected")
    ? "champion_round"
    : replay.batch?.events.some((event) => event.eventType === "score_created")
      ? "scoring_round"
      : replay.batch?.round ?? "proposal_round";
  return (
    <section className={`arena-stage ${compact ? "compact" : ""}`} aria-label="Live agent battle" data-battle-id={battleId}>
      <header className="arena-header"><div><span className="live-label">LIVE BATTLE</span><strong>AGENT ARENA</strong><small>BATTLE ID · {battleId.toUpperCase()}</small></div><div className="round-meta"><span>ROUND {replay.batchIndex + 1} / {replay.batchCount}</span><b>02:14</b></div></header>
      <RoundBanner round={effectiveRound} roundIndex={replay.batchIndex} roundCount={replay.batchCount} />
      <div className="fighters">
        {teams.map((team) => {
          const event = latestByActor.get(team.id);
          const active = activeActors.has(team.id);
          const defense = replay.batch?.events.find((item) => item.eventType === "defense_created" && item.actorId === team.id);
          const defensePayload = defense?.rawPayload as { attackId?: string; acceptedAttack?: boolean } | undefined;
          const linkedAttack = events.find((item) => item.eventType === "attack_created" && (item.rawPayload as { id?: string } | undefined)?.id === defensePayload?.attackId);
          const severity = (linkedAttack?.rawPayload as { severity?: Severity } | undefined)?.severity;
          const hit = Boolean(defensePayload?.acceptedAttack);
          return <article key={team.id} className={`fighter ${team.color} ${active ? "active" : ""} ${hit ? "hit" : ""}`}><div className="agent-portrait"><img src={team.portrait} alt={`${team.name} combat portrait`} /></div><div className="fighter-name"><span>{team.name}</span><small>{team.role}</small></div><HpBar teamId={team.id} hp={hp[team.id] ?? 100} prevHp={prevHp[team.id]} severity={hit ? severity : undefined} /><div className="event-copy"><span>{event?.eventType.replace("_created", "").toUpperCase() ?? "STANDING BY"}</span>{defensePayload && <b className={`verdict ${hit ? "accepted" : "rejected"}`}>{hit ? "ACCEPTED" : "REJECTED"}</b>}<TypewriterText as="p" key={event?.id} text={event?.content ?? "Waiting for the round signal…"} active={active} keepCursor={active} /><small>{active ? "Typing_" : "Evidence locked"}</small></div></article>;
        })}
      </div>
      <div className="arena-host-slot">
        <ArenaHost events={replay.batch?.events ?? []} active={replay.playing} />
      </div>
      <div className="replay-controls"><button type="button" onClick={replay.toggle}>{replay.playing ? "PAUSE" : "PLAY"}</button><div><i style={{ width: `${((replay.batchIndex + 1) / replay.batchCount) * 100}%` }} /></div><button type="button" onClick={replay.cycleSpeed}>{replay.speed}×</button><button type="button" onClick={replay.replay}>REPLAY</button></div>
      {!compact && <div className="round-jump" aria-label="Jump to round">{Array.from({length: replay.batchCount},(_,index) => <button className={index === replay.batchIndex ? "active" : ""} key={index} onClick={() => replay.seek(index)}>{index + 1}</button>)}</div>}
    </section>
  );
}
