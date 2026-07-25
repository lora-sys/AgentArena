import { type BattleEvent, type Severity } from "@agent-arena/contracts";
import { demoEvents, teams, goldenFatalDemo } from "../data/demo";
import { useArenaState, useBattleReplay } from "./BattleReplayPlayer";
import { TypewriterText } from "./typewriter-text";
import { RoundBanner } from "./round-banner";
import { ArenaHost } from "./arena-host";
import { HpBar } from "./hp-bar";
import { FatalTakeover, type FatalTakeoverProps } from "./fatal-takeover";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { liveArenaZh as zh } from "../i18n/zh";
import { ArtifactModal } from "./artifact-modal";
import { AgentCardArtifactTrigger } from "./agent-card-artifact-trigger";

type FatalState = Omit<FatalTakeoverProps, "open" | "onDismiss">;

export function ArenaStage({ compact = false, battleId = "demo", events = demoEvents, onProgress, onFatalEvidence }: { compact?: boolean; battleId?: string; events?: readonly BattleEvent[]; onProgress?: (events: readonly BattleEvent[]) => void; onFatalEvidence?: (event: BattleEvent) => void }) {
  const replay = useBattleReplay(events);
  const teamIds = teams.map((team) => team.id);
  const { hp, latestByActor } = useArenaState(events, teamIds, replay.visibleEvents);
  useEffect(() => onProgress?.(replay.visibleEvents), [onProgress, replay.visibleEvents]);
  // 致命攻击接管态（#34）：null=未接管
  const [fatal, setFatal] = useState<FatalState | null>(null);
  const [fatalEvent, setFatalEvent] = useState<BattleEvent | null>(null);
  const [artifactTeamId, setArtifactTeamId] = useState<string | null>(null);
  const closeArtifact = useCallback(() => setArtifactTeamId(null), []);
  const shownFatalRef = useRef<string | null>(null);
  const [searchParams] = useSearchParams();
  // 演示触发器：?fatal=1 合成金色剧情致命时刻（pitch 手动唤起 + 取证用）；真实 fixture 落地后由 onFatal 路径驱动
  useEffect(() => {
    if (searchParams.get("fatal") === "1") setFatal(goldenFatalDemo);
  }, [searchParams]);
  const teamName = (id?: string) => teams.find((team) => team.id === id)?.name ?? id ?? "";
  useEffect(() => {
    if (replay.batchIndex === 0) shownFatalRef.current = null;
    const attack = replay.batch?.events.find((event) =>
      event.eventType === "attack_created"
      && (event.rawPayload as { severity?: Severity } | undefined)?.severity === "fatal",
    );
    if (!attack || shownFatalRef.current === attack.id) return;
    const payload = attack.rawPayload as { id?: string; targetTeamId?: string } | undefined;
    shownFatalRef.current = attack.id;
    setFatalEvent(attack);
    setFatal({
      attacker: teamName(attack.actorId),
      attackerPortrait: teams.find((team) => team.id === attack.actorId)?.portrait,
      target: teamName(attack.targetId ?? payload?.targetTeamId),
      targetPortrait: teams.find((team) => team.id === (attack.targetId ?? payload?.targetTeamId))?.portrait,
      attackTitle: payload?.id ?? attack.title,
      attackSummary: attack.content,
      hpBefore: 88,
      damage: 50,
      hpAfter: 38,
    });
    onFatalEvidence?.(attack);
  }, [onFatalEvidence, replay.batch, replay.batchIndex]);
  useEffect(() => {
    if (!fatal) return;
    const timer = window.setTimeout(() => setFatal(null), 5000);
    return () => window.clearTimeout(timer);
  }, [fatal]);
  const activeActors = new Set(replay.batch?.events.map((event) => event.actorId));
  const currentAttack = [...replay.visibleEvents].reverse().find((event) => event.eventType === "attack_created");
  const currentAttackPayload = currentAttack?.rawPayload as { id?: string; targetTeamId?: string; severity?: Severity; evidence?: string } | undefined;
  const currentAttackId = currentAttackPayload?.id;
  const evidenceChain = replay.visibleEvents.filter((event) => {
    const payload = event.rawPayload as { id?: string; attackId?: string; linkedEventIds?: string[] } | undefined;
    return currentAttackId && (payload?.id === currentAttackId || payload?.attackId === currentAttackId || payload?.linkedEventIds?.includes(currentAttackId));
  });
  const verifiedProof = (teamId: string): number => {
    if (battleId !== "BA-2026-0024") return hp[teamId] ?? teams.find((team) => team.id === teamId)?.hp ?? 100;
    const hasChampion = replay.visibleEvents.some((event) => event.eventType === "champion_selected");
    const hasRecovery = replay.visibleEvents.some((event) => (event.rawPayload as { id?: string } | undefined)?.id === "test_052");
    const hasFatal = replay.visibleEvents.some((event) => (event.rawPayload as { id?: string } | undefined)?.id === "attack_031");
    if (teamId === "viral_designer") return hasChampion ? 87 : hasRecovery ? 68 : hasFatal ? 38 : 88;
    if (teamId === "safe_builder") return hasChampion ? 78 : 72;
    if (teamId === "infra_hacker") return hasChampion ? 84 : 81;
    return hp[teamId] ?? 100;
  };
  const proofHp = Object.fromEntries(teamIds.map((teamId) => [teamId, verifiedProof(teamId)]));
  const prevProofRef = useRef<Record<string, number>>({});
  const prevProof = prevProofRef.current;
  useEffect(() => { prevProofRef.current = proofHp; }, [proofHp]);
  // 展示层回合 key：优先识别冠军 / 评分事件，否则用 batch 的 Engine 回合
  const effectiveRound = replay.batch?.events.some((event) => event.eventType === "champion_selected")
    ? "champion_round"
    : replay.batch?.events.some((event) => event.eventType === "score_created")
      ? "scoring_round"
      : replay.batch?.round ?? "proposal_round";
  return (
    <section className={`arena-stage ${compact ? "compact" : ""}`} aria-label="Live agent battle" data-battle-id={battleId}>
      <header className="arena-header"><div><span className="live-label">LIVE</span><strong>{zh.arena.battle} {battleId.toUpperCase()}</strong><small>{zh.arena.idea}</small></div><div className="round-meta"><span>{zh.arena.rules}</span><span>{zh.arena.share}</span><b>02:14</b></div></header>
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
          const sparkline = team.id === "viral_designer" ? "2,8 32,7 58,21 88,22 118,14 148,12 178,5" : team.id === "safe_builder" ? "2,18 32,15 58,17 88,12 118,14 148,9 178,10" : "2,19 32,14 58,16 88,10 118,13 148,8 178,7";
          return <article key={team.id} className={`fighter ${team.color} ${active ? "active" : ""} ${hit ? "hit" : ""}`}>
            <div className="agent-portrait"><img src={team.portrait} alt="" /></div>
            <div className="fighter-name"><span>{team.name}</span><small>{team.role}</small></div>
            <HpBar teamId={team.id} hp={proofHp[team.id]} prevHp={prevProof[team.id]} severity={hit ? severity : undefined} onFatal={() => setFatal({ attacker: teamName(linkedAttack?.actorId), attackerPortrait: teams.find((item) => item.id === linkedAttack?.actorId)?.portrait, target: team.name, targetPortrait: team.portrait, attackTitle: linkedAttack?.title ?? currentAttackId ?? "attack", attackSummary: linkedAttack?.content, hpBefore: prevProof[team.id] ?? 100, damage: Math.max(0, (prevProof[team.id] ?? 100) - (proofHp[team.id] ?? 0)), hpAfter: proofHp[team.id] ?? 0 })} />
            <svg className="proof-sparkline" viewBox="0 0 180 28" role="img" aria-label={`${team.name} ${zh.arena.hp}趋势`}><polyline points={sparkline} /></svg>
            <div className="fighter-roles">{zh.arena.roles.map((role) => <span key={role}>{role}</span>)}</div>
            {!compact && <AgentCardArtifactTrigger onOpen={() => setArtifactTeamId(team.id)} />}
            <div className="event-copy"><span>{event ? zh.arena.eventType[event.eventType] ?? event.eventType : zh.arena.standingBy}</span>{defensePayload && <b className={`verdict ${hit ? "accepted" : "rejected"}`}>{hit ? zh.arena.accepted : zh.arena.rejected}</b>}<TypewriterText as="p" key={event?.id} text={event?.content ?? zh.arena.waitingSignal} active={active} keepCursor={active} /><small>{active ? zh.arena.typing : zh.arena.evidenceLocked}</small></div>
          </article>;
        })}
      </div>
      {!compact && currentAttack && <section className={`attack-focus ${currentAttackPayload?.severity === "fatal" ? "fatal" : ""}`}>
        <header><span>{zh.arena.currentAttack}</span><b>{currentAttackPayload?.severity ?? "high"}</b></header>
        <div className="attack-focus-main"><div><small>{zh.arena.attacker}</small><strong>{teamName(currentAttack.actorId)}</strong></div><div className="attack-focus-event"><small>{currentAttackId}</small><strong>{currentAttack.title}</strong><p>{currentAttack.content}</p></div><div><small>{zh.arena.target}</small><strong>{teamName(currentAttack.targetId ?? currentAttackPayload?.targetTeamId)}</strong></div></div>
        <div className="evidence-chain"><b>{zh.arena.evidenceChain}</b><ol>{(evidenceChain.length ? evidenceChain : [currentAttack]).map((item) => <li key={item.id}><span>{(item.rawPayload as { id?: string } | undefined)?.id ?? item.id}</span><small>{item.title}</small></li>)}</ol></div>
      </section>}
      <div className="arena-lower"><section className="event-stream"><header>{zh.arena.eventStream}</header>{replay.visibleEvents.slice(-5).reverse().map((item) => <div key={item.id}><time>{new Date(item.createdAt).toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time><span>{item.title}</span></div>)}</section><div className="arena-host-slot"><ArenaHost events={replay.batch?.events ?? []} active={replay.playing} /></div></div>
      <div className="replay-controls"><button type="button" onClick={replay.toggle}>{replay.playing ? zh.common.pause : zh.common.resume}</button><div><i style={{ width: `${((replay.batchIndex + 1) / replay.batchCount) * 100}%` }} /></div><button type="button" onClick={replay.cycleSpeed}>{replay.speed}×</button><button type="button" onClick={replay.replay}>{zh.common.replay}</button></div>
      {!compact && <div className="round-jump" aria-label="跳转到回合">{Array.from({length: replay.batchCount},(_,index) => <button className={index === replay.batchIndex ? "active" : ""} key={index} onClick={() => replay.seek(index)}>{index + 1}</button>)}</div>}
      <FatalTakeover open={fatal !== null} {...(fatal ?? { attacker: "", target: "", attackTitle: "", hpBefore: 0, damage: 0, hpAfter: 0 })} onViewEvidence={onFatalEvidence && fatalEvent ? () => onFatalEvidence(fatalEvent) : undefined} onDismiss={() => setFatal(null)} />
      <ArtifactModal open={artifactTeamId !== null} teamName={teamName(artifactTeamId ?? undefined)} onClose={closeArtifact} />
    </section>
  );
}
