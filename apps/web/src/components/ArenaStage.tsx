import { DAMAGE_MAP, type BattleEvent, type Severity } from "@agent-arena/contracts";
import { demoEvents, teams } from "../data/demo";
import { useArenaState, useBattleReplay } from "./BattleReplayPlayer";
import { useEffect } from "react";
import { t, type ZhKey } from "../i18n";

const roundNames: Record<string, ZhKey> = {
  proposal_round: "arena.legacy.proposal",
  cross_attack_round: "arena.legacy.attack",
  defense_round: "arena.legacy.defense",
  scoring_round: "arena.legacy.scoring",
  champion_round: "arena.legacy.champion",
};

export function ArenaStage({ compact = false, battleId = "demo", events = demoEvents, onProgress }: { compact?: boolean; battleId?: string; events?: readonly BattleEvent[]; onProgress?: (events: readonly BattleEvent[]) => void }) {
  const replay = useBattleReplay(events);
  const teamIds = teams.map((team) => team.id);
  const { hp, latestByActor } = useArenaState(events, teamIds, replay.visibleEvents);
  useEffect(() => onProgress?.(replay.visibleEvents), [onProgress, replay.visibleEvents]);
  const activeActors = new Set(replay.batch?.events.map((event) => event.actorId));
  const roundTitle = replay.batch?.events.some((event) => event.eventType === "champion_selected")
    ? t("arena.legacy.champion")
    : replay.batch?.events.some((event) => event.eventType === "score_created")
      ? t("arena.legacy.scoring")
      : t(roundNames[replay.batch?.round ?? "proposal_round"] ?? "arena.legacy.proposal");
  return (
    <section className={`arena-stage ${compact ? "compact" : ""}`} aria-label={t("arena.legacy.live_battle")} data-battle-id={battleId}>
      <header className="arena-header"><div><span className="live-label">{t("arena.legacy.live_battle")}</span><strong>AGENT ARENA</strong><small>{t("arena.header.battle_label")} ID · {battleId.toUpperCase()}</small></div><div className="round-meta"><span>{t("arena.legacy.round")} {replay.batchIndex + 1} / {replay.batchCount}</span><b>02:14</b></div></header>
      <div className="round-banner" key={roundTitle}><span>{t("arena.legacy.round")} {replay.batchIndex + 1} / {replay.batchCount}</span><h2>{roundTitle}</h2></div>
      <div className="fighters">
        {teams.map((team) => {
          const event = latestByActor.get(team.id);
          const active = activeActors.has(team.id);
          const defense = replay.batch?.events.find((item) => item.eventType === "defense_created" && item.actorId === team.id);
          const defensePayload = defense?.rawPayload as { attackId?: string; acceptedAttack?: boolean } | undefined;
          const linkedAttack = events.find((item) => item.eventType === "attack_created" && (item.rawPayload as { id?: string } | undefined)?.id === defensePayload?.attackId);
          const severity = (linkedAttack?.rawPayload as { severity?: Severity } | undefined)?.severity;
          const hit = Boolean(defensePayload?.acceptedAttack);
          const damage = hit && severity ? DAMAGE_MAP[severity] : 0;
          return <article key={team.id} className={`fighter ${team.color} ${active ? "active" : ""} ${hit ? "hit" : ""}`}>{damage > 0 && <b className="damage-pop">-{damage}</b>}<div className="agent-portrait"><img src={team.portrait} alt="" /></div><div className="fighter-name"><span>{team.name}</span><small>{team.role}</small></div><div className="hp-label"><span>{t("arena.agent_card.proof_label")}</span><b>{hp[team.id] ?? 100}/100</b></div><div className="hp-track"><i style={{ width: `${hp[team.id] ?? 100}%` }} /></div><div className="event-copy"><span>{roundTitle}</span>{defensePayload && <b className={`verdict ${hit ? "accepted" : "rejected"}`}>{hit ? t("arena.legacy.accepted") : t("arena.legacy.rejected")}</b>}<p key={event?.id} className={active ? "typing" : ""}>{event?.content ?? t("arena.legacy.waiting")}</p><small>{active ? t("arena.legacy.typing") : t("arena.legacy.evidence_locked")}</small></div></article>;
        })}
      </div>
      <div className="commentary"><b>● {t("arena.legacy.commentary")}</b><span>{commentaryFor(replay.batch?.events ?? [])}</span></div>
      <div className="replay-controls"><button type="button" onClick={replay.toggle}>{replay.playing ? t("arena.legacy.pause") : t("arena.legacy.play")}</button><div><i style={{ width: `${((replay.batchIndex + 1) / replay.batchCount) * 100}%` }} /></div><button type="button" onClick={replay.cycleSpeed}>{replay.speed}×</button><button type="button" onClick={replay.replay}>{t("arena.legacy.replay")}</button></div>
      {!compact && <div className="round-jump" aria-label={t("arena.legacy.jump_round")}>{Array.from({length: replay.batchCount},(_,index) => <button className={index === replay.batchIndex ? "active" : ""} key={index} onClick={() => replay.seek(index)}>{index + 1}</button>)}</div>}
    </section>
  );
}

function commentaryFor(events: readonly BattleEvent[]) {
  const event = events[events.length - 1];
  if (!event) return t("arena.legacy.commentary.standby");
  if (event.eventType === "proposal_created") return t("arena.legacy.commentary.proposal");
  if (event.eventType === "attack_created") return `${event.title}。${t("arena.legacy.commentary.attack")}`;
  if (event.eventType === "defense_created") return event.content;
  if (event.eventType === "score_created") return t("arena.legacy.commentary.scoring");
  if (event.eventType === "champion_selected") return `${event.title}。${t("arena.legacy.commentary.champion")}`;
  return event.content;
}
