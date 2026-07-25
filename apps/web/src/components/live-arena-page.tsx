import { useEffect, useMemo, useState } from "react";
import type { BattleEvent, Severity } from "@agent-arena/contracts";
import { DAMAGE_MAP, RECOVERY_RATIO } from "@agent-arena/contracts";
import { t } from "../i18n";
import { HpBar, type HpBarHit } from "./hp-bar";
import { RoundProgress, type RoundStage } from "./round-progress";
import { RuntimeModeBadge, type RuntimeMode } from "./runtime-mode-badge";
import { ArenaHost } from "./arena-host";
import { TypewriterText } from "./typewriter-text";
import styles from "./live-arena-page.module.css";

export type LiveArenaTeam = {
  id: string;
  name: string;
  subtitle: string;
  accentColor: string;
  role: string;
  portrait: string;
};

export const V052_TEAMS: readonly LiveArenaTeam[] = [
  { id: "team_safe_v1", name: t("arena.team.safe.name"), subtitle: t("arena.team.safe.subtitle"), accentColor: "var(--team-safe)", role: t("arena.team.safe.role"), portrait: "/assets/agents/safe-builder.png" },
  { id: "team_viral_v1", name: t("arena.team.viral.name"), subtitle: t("arena.team.viral.subtitle"), accentColor: "var(--team-viral)", role: t("arena.team.viral.role"), portrait: "/assets/agents/viral-designer.png" },
  { id: "team_infra_v1", name: t("arena.team.infra.name"), subtitle: t("arena.team.infra.subtitle"), accentColor: "var(--team-infra)", role: t("arena.team.infra.role"), portrait: "/assets/agents/infra-hacker.png" },
];

const ACTOR_TO_TEAM: Record<string, string> = {
  agent_safe_builder_lead: "team_safe_v1",
  agent_viral_designer_lead: "team_viral_v1",
  agent_infra_hacker_lead: "team_infra_v1",
};

function participantName(id: string | undefined): string {
  if (!id) return "—";
  const teamId = ACTOR_TO_TEAM[id] ?? id;
  return V052_TEAMS.find((team) => team.id === teamId)?.name ?? id;
}

function eventTypeLabel(type: BattleEvent["eventType"]): string {
  const labels: Partial<Record<BattleEvent["eventType"], string>> = {
    brief_created: t("arena.event.brief"), team_created: t("arena.event.team"), proposal_created: t("arena.event.proposal"), attack_created: t("arena.event.attack"),
    defense_created: t("arena.event.defense"), score_created: t("arena.event.score"), champion_selected: t("arena.event.champion"), artifact_created: t("arena.event.artifact"),
    replay_created: t("arena.event.replay"), passport_created: t("arena.event.passport"), commentary_created: t("arena.event.activity"), error: t("arena.event.error"),
  };
  return labels[type] ?? t("arena.event.generic");
}

type AgentActivity = {
  kind: "agent_activity";
  teamId: string;
  phase: "proposal" | "attack" | "defense" | "judge" | "artifact";
  status: "working" | "complete";
  summary: string;
  progress: number;
  elapsedMs?: number;
};

const PHASE_STEPS: Record<AgentActivity["phase"], readonly string[]> = {
  proposal: [t("arena.phase.proposal.1"), t("arena.phase.proposal.2"), t("arena.phase.proposal.3"), t("arena.phase.proposal.4")],
  attack: [t("arena.phase.attack.1"), t("arena.phase.attack.2"), t("arena.phase.attack.3"), t("arena.phase.attack.4")],
  defense: [t("arena.phase.defense.1"), t("arena.phase.defense.2"), t("arena.phase.defense.3"), t("arena.phase.defense.4")],
  judge: [t("arena.phase.judge.1"), t("arena.phase.judge.2"), t("arena.phase.judge.3"), t("arena.phase.judge.4")],
  artifact: [t("arena.phase.artifact.1"), t("arena.phase.artifact.2"), t("arena.phase.artifact.3"), t("arena.phase.artifact.4")],
};

function readAgentActivity(event: BattleEvent): AgentActivity | null {
  const payload = event.rawPayload as Partial<AgentActivity> | undefined;
  if (event.eventType !== "commentary_created" || payload?.kind !== "agent_activity") return null;
  if (!payload.teamId || !payload.phase || !payload.status || !payload.summary || typeof payload.progress !== "number") return null;
  return payload as AgentActivity;
}

function eventTeamId(event: BattleEvent): string | undefined {
  const payload = event.rawPayload as { teamId?: string; attackerTeamId?: string } | undefined;
  const actorTeam = ACTOR_TO_TEAM[event.actorId ?? ""] ?? (event.actorId?.startsWith("team_") ? event.actorId : undefined);
  return payload?.teamId ?? payload?.attackerTeamId ?? actorTeam ?? event.targetId;
}

const ROUND_TO_STAGE: Record<string, RoundStage> = {
  briefing: "brief",
  team_generation: "brief",
  proposal_round: "proposal",
  build_round: "build",
  cross_attack_round: "attack",
  defense_round: "defense",
  verify_round: "verify",
  judging_round: "judgment",
  artifact_generation: "judgment",
  replay_generation: "judgment",
};

export type LiveArenaPageProps = {
  battleId: string;
  idea: string;
  events: readonly BattleEvent[];
  mode: RuntimeMode;
  /** optional live elapsed ms (rendered as timer) */
  elapsedMs?: number;
  /** trigger: open artifact viewer modal for a team */
  onOpenArtifact?: (teamId: string) => void;
  /** trigger: open evidence lens modal for a team */
  onOpenEvidenceLens?: (teamId: string) => void;
  /** trigger: fatal attack takeover auto-opens evidence lens */
  onFatalAttack?: (event: BattleEvent) => void;
  /** browser-evidence trigger for the deterministic fatal frame */
  forceFatal?: boolean;
  replayPaused?: boolean;
  replayComplete?: boolean;
  /** Replays persisted events from event 1, including completed live_runtime battles. */
  replayPlayback?: boolean;
  championAvailable?: boolean;
  replayProgress?: { current: number; total: number };
  onToggleReplay?: () => void;
  onRestartReplay?: () => void;
  onViewChampion?: () => void;
  liveHeartbeatCount?: number;
};

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function lastFatalAttack(events: readonly BattleEvent[]): BattleEvent | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.eventType !== "attack_created") continue;
    const severity = (event.rawPayload as { severity?: string } | undefined)?.severity;
    if (severity === "fatal") return event;
  }
  return null;
}

function lastAcceptedDefenseFor(events: readonly BattleEvent[], attackId: string): BattleEvent | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.eventType !== "defense_created") continue;
    const payload = event.rawPayload as { attackId?: string; acceptedAttack?: boolean } | undefined;
    if (payload?.attackId === attackId && payload.acceptedAttack) return event;
  }
  return null;
}

export function LiveArenaPage({
  battleId,
  idea,
  events,
  mode,
  elapsedMs = 0,
  onOpenArtifact,
  onOpenEvidenceLens,
  onFatalAttack,
  forceFatal = false,
  replayPaused = false,
  replayComplete = false,
  replayPlayback = false,
  championAvailable = false,
  replayProgress,
  onToggleReplay,
  onRestartReplay,
  onViewChampion,
  liveHeartbeatCount = 0,
}: LiveArenaPageProps) {
  const [fatalTakeover, setFatalTakeover] = useState<BattleEvent | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const fatalAttack = useMemo(() => lastFatalAttack(events), [events]);
  const currentRound = events.length > 0 ? events[events.length - 1].round : "briefing";
  const currentStage: RoundStage = ROUND_TO_STAGE[currentRound] ?? "brief";

  // Start the 3.2s takeover exactly once per fatal event. Subsequent SSE events
  // must not restart this timer and make the attack screen linger indefinitely.
  useEffect(() => {
    if (!fatalAttack) return;
    setFatalTakeover(fatalAttack);
    onFatalAttack?.(fatalAttack);
    if (forceFatal) return;
    const timer = setTimeout(() => setFatalTakeover(null), 3200);
    return () => clearTimeout(timer);
  }, [fatalAttack, forceFatal, onFatalAttack]);

  // A defense can dismiss the takeover early, without resetting its timer.
  useEffect(() => {
    if (!fatalTakeover || forceFatal) return;
    const attackId = (fatalTakeover.rawPayload as { id?: string }).id ?? "";
    if (attackId && lastAcceptedDefenseFor(events, attackId)) setFatalTakeover(null);
  }, [events, fatalTakeover, forceFatal]);

  // Compute HP and last hits per team.
  // Mirrors contracts reduceArenaHp: damage on accepted attack; passing test
  // event recovers 60% of the most recent un-recovered accepted attack on
  // that team (each attack can only recover once).
  const { hpByTeam, lastHitByTeam } = useMemo(() => {
    const hp: Record<string, number> = Object.fromEntries(V052_TEAMS.map((team) => [team.id, mode === "verified_replay" && team.id === "team_viral_v1" ? 88 : 100]));
    const lastHit: Record<string, HpBarHit | null> = Object.fromEntries(V052_TEAMS.map((team) => [team.id, null]));
    const attacks = new Map<string, { severity: Severity; targetTeamId: string }>();
    const damageByAttack = new Map<string, { teamId: string; damage: number }>();
    const recoveredAttacks = new Set<string>();
    for (const event of events) {
      if (event.eventType === "attack_created") {
        const payload = event.rawPayload as { id?: string; severity?: Severity; targetTeamId?: string } | undefined;
        if (payload?.id && payload.severity && payload.targetTeamId) {
          attacks.set(payload.id, { severity: payload.severity, targetTeamId: payload.targetTeamId });
        }
        continue;
      }
      if (event.eventType === "defense_created") {
        const payload = event.rawPayload as { attackId?: string; teamId?: string; acceptedAttack?: boolean } | undefined;
        if (!payload?.acceptedAttack || !payload.attackId || !payload.teamId) continue;
        // BA-2026-0024 的写锁曲线只由 attack_031 及其验证修复驱动：88→38→68。
        if (mode === "verified_replay" && payload.teamId === "team_viral_v1" && payload.attackId !== "attack_031") continue;
        const attack = attacks.get(payload.attackId);
        if (!attack) continue;
        const damage = DAMAGE_MAP[attack.severity];
        hp[payload.teamId] = Math.max(0, (hp[payload.teamId] ?? 100) - damage);
        damageByAttack.set(payload.attackId, { teamId: payload.teamId, damage });
        lastHit[payload.teamId] = { severity: attack.severity, damage, hitId: payload.attackId };
        continue;
      }
      // Test pass events (artifact_created with rawPayload.passed === true)
      if (event.eventType === "artifact_created") {
        const payload = event.rawPayload as { id?: string; teamId?: string; passed?: boolean } | undefined;
        if (!payload?.passed || !payload.teamId) continue;
        // Find most recent un-recovered accepted attack against this team
        const entries = [...damageByAttack.entries()].reverse();
        for (const [attackId, record] of entries) {
          if (record.teamId !== payload.teamId) continue;
          if (recoveredAttacks.has(attackId)) continue;
          const heal = Math.round(record.damage * RECOVERY_RATIO);
          hp[payload.teamId] = Math.min(100, (hp[payload.teamId] ?? 100) + heal);
          recoveredAttacks.add(attackId);
          break;
        }
      }
    }
    return { hpByTeam: hp, lastHitByTeam: lastHit };
  }, [events, mode]);

  // Current attack focus card: latest attack event
  const currentAttack = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].eventType === "attack_created") return events[i];
    }
    return null;
  }, [events]);

  // Event stream: everything, latest first
  const eventStream = useMemo(() => [...events].reverse().slice(0, 12), [events]);

  const teamSnapshots = useMemo(() => Object.fromEntries(V052_TEAMS.map((team) => {
    const activities = events
      .map((event) => ({ event, activity: readAgentActivity(event) }))
      .filter((entry): entry is { event: BattleEvent; activity: AgentActivity } => entry.activity?.teamId === team.id);
    const latestActivity = activities.at(-1)?.activity;
    const proposalEvent = [...events].reverse().find((event) => event.eventType === "proposal_created" && eventTeamId(event) === team.id);
    const attackEvent = [...events].reverse().find((event) => event.eventType === "attack_created" && eventTeamId(event) === team.id);
    const incomingAttack = [...events].reverse().find((event) => event.eventType === "attack_created" && event.targetId === team.id);
    const defenseEvent = [...events].reverse().find((event) => event.eventType === "defense_created" && eventTeamId(event) === team.id);
    const scoreEvent = [...events].reverse().find((event) => event.eventType === "score_created" && event.targetId === team.id);
    const artifactEvent = [...events].reverse().find((event) => event.eventType === "artifact_created" && (event.targetId === team.id || eventTeamId(event) === team.id));
    const fallbackPhase: AgentActivity["phase"] = currentStage === "attack"
      ? "attack"
      : currentStage === "defense" || currentStage === "verify"
        ? "defense"
        : currentStage === "judgment"
          ? artifactEvent ? "artifact" : "judge"
          : "proposal";
    const phase = latestActivity?.phase ?? fallbackPhase;
    const relevantEvents = events.filter((event) => eventTeamId(event) === team.id || event.targetId === team.id);
    const latestRelevant = relevantEvents.at(-1);
    const stageEvent = (phase === "proposal" ? proposalEvent : phase === "attack" ? attackEvent : phase === "defense" ? defenseEvent : phase === "judge" ? scoreEvent : artifactEvent) ?? latestRelevant;
    const working = latestActivity?.status === "working" || (!latestActivity && !stageEvent && !replayComplete);
    const phaseSteps = PHASE_STEPS[phase];
    const pulseIndex = activities.length % phaseSteps.length;
    const progress = latestActivity?.status === "complete"
      ? 100
      : latestActivity?.progress ?? 14;
    const proposal = proposalEvent?.rawPayload as { productName?: string; oneLiner?: string; technicalHighlight?: string } | undefined;
    const defense = defenseEvent?.rawPayload as { acceptedAttack?: boolean; revision?: string; responseToAttack?: string } | undefined;
    const toolCount = new Set(relevantEvents.map((event) => event.eventType)).size;
    return [team.id, {
      phase,
      working,
      statusLine: latestActivity?.summary ?? (working ? phaseSteps[pulseIndex] : stageEvent?.title ?? t("arena.card.wait_signal")),
      action: latestActivity?.summary ?? stageEvent?.title ?? t("arena.card.wait_engine"),
      observation: incomingAttack?.content ?? proposal?.technicalHighlight ?? proposal?.oneLiner ?? t("arena.card.no_observation"),
      decision: defense ? (defense.acceptedAttack ? `${t("arena.card.accept_revision")}：${defense.revision ?? defense.responseToAttack ?? t("arena.card.revision_ready")}` : `${t("arena.card.reject_evidence")}：${defense.responseToAttack ?? t("arena.card.claim_insufficient")}`) : t("arena.card.wait_decision"),
      progress,
      evidenceCount: relevantEvents.filter((event) => event.eventType !== "commentary_created").length,
      toolCount,
      version: defenseEvent ? 2 : proposalEvent ? 1 : 0,
      previewTitle: proposal?.productName ?? proposalEvent?.title.replace(/\s*提案$/, "") ?? t("arena.card.artifact_generating"),
      previewBody: proposal?.oneLiner ?? proposalEvent?.content ?? t("arena.card.artifact_body"),
      activityEvents: activities.slice(-3),
      artifactReady: Boolean(artifactEvent),
    }];
  })), [currentStage, events, replayComplete]);

  const latestDefense = useMemo(() => [...events].reverse().find((event) => event.eventType === "defense_created"), [events]);
  const championTeamId = useMemo(() => {
    const event = [...events].reverse().find((candidate) => candidate.eventType === "champion_selected");
    const payload = event?.rawPayload as { winnerTeamId?: string } | undefined;
    return payload?.winnerTeamId ?? event?.targetId;
  }, [events]);
  const fatalDisplay = useMemo(() => {
    if (!fatalTakeover) return null;
    const payload = fatalTakeover.rawPayload as { id?: string; severity?: Severity; evidence?: string; suggestedFix?: string } | undefined;
    const damage = DAMAGE_MAP[payload?.severity ?? "fatal"] ?? 50;
    const targetId = fatalTakeover.targetId ?? "";
    const currentHp = hpByTeam[targetId] ?? 100;
    const accepted = payload?.id ? Boolean(lastAcceptedDefenseFor(events, payload.id)) : false;
    return {
      payload,
      damage,
      before: accepted ? Math.min(100, currentHp + damage) : currentHp,
      after: accepted ? currentHp : Math.max(0, currentHp - damage),
      attacker: V052_TEAMS.find((team) => team.id === (ACTOR_TO_TEAM[fatalTakeover.actorId ?? ""] ?? fatalTakeover.actorId)),
      target: V052_TEAMS.find((team) => team.id === targetId),
    };
  }, [events, fatalTakeover, hpByTeam]);

  return (
    <div className={styles.root} data-mode={mode} data-testid="live-arena-page">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.battleId}>{t("arena.header.battle_label")} {battleId}</span>
          <span className={styles.liveDot} aria-label={replayPlayback ? t("arena.header.replay") : t("arena.header.live")}>
            {replayPlayback ? t("arena.header.replay") : t("arena.header.live")}
          </span>
          <span className={styles.timer}>{formatElapsed(elapsedMs)}</span>
        </div>
        <div className={styles.headerRight}>
          <button type="button" className={styles.headerButton} aria-expanded={rulesOpen} aria-controls="arena-rules" onClick={() => setRulesOpen((open) => !open)}>
            {t("arena.header.rules")}
          </button>
          <button type="button" className={styles.headerButton} onClick={() => {
            void navigator.clipboard?.writeText(window.location.href).then(() => setShareCopied(true));
          }}>
            {shareCopied ? t("arena.header.copied") : t("arena.header.share")}
          </button>
        </div>
      </header>

      {rulesOpen && (
        <aside id="arena-rules" className={styles.rulesPanel} role="region" aria-label={t("arena.rules.title")}>
          <div><strong>{t("arena.rules.title")}</strong><button type="button" onClick={() => setRulesOpen(false)} aria-label={t("common.close")}>×</button></div>
          <p>{t("arena.rules.body")}</p>
          <ol>
            <li>{t("round.stage.proposal")}</li><li>{t("round.stage.attack")}</li><li>{t("round.stage.defense")}</li><li>{t("round.stage.verify")}</li><li>{t("round.stage.judgment")}</li>
          </ol>
        </aside>
      )}

      <div className={styles.subhead}>
        <p className={styles.idea}>
          <span className={styles.ideaPrefix}>{t("arena.idea_prefix")}</span>
          {idea}
        </p>
        <RuntimeModeBadge mode={mode} completed={mode === "live_runtime" && replayComplete} replaying={mode === "live_runtime" && replayPlayback} />
      </div>

      <RoundProgress currentStage={currentStage} />

      {mode === "live_runtime" && !replayPlayback && (
        <div className={styles.livePulse} role="status">
          <span className={styles.livePulseDot} />
          <span>{replayComplete ? t("arena.live.complete") : t("arena.live.generating")} · {t("arena.live.heartbeat")} {liveHeartbeatCount}</span>
          {replayComplete && championAvailable && <button type="button" onClick={onViewChampion}>{t("arena.replay.view_champion")}</button>}
        </div>
      )}

      {replayPlayback && (
        <div className={styles.replayControls} aria-label={t("arena.replay.controls")}>
          <span>{replayComplete ? t("arena.replay.complete") : t("arena.replay.playing")} {replayProgress ? `${replayProgress.current}/${replayProgress.total}` : ""}</span>
          <button type="button" onClick={onToggleReplay} disabled={replayComplete}>{replayPaused ? t("arena.replay.resume") : t("arena.replay.pause")}</button>
          <button type="button" onClick={onRestartReplay}>{t("arena.replay.restart")}</button>
          {replayComplete && championAvailable && <button type="button" onClick={onViewChampion}>{t("arena.replay.view_champion")}</button>}
        </div>
      )}

      <section className={styles.teams}>
        {V052_TEAMS.map((team) => {
          const snapshot = teamSnapshots[team.id];
          return (
          <article key={team.id} className={styles.teamCard} style={{ borderColor: team.accentColor }} data-working={snapshot.working}>
            <header className={styles.teamHeader}>
              <img className={styles.teamPortrait} src={team.portrait} alt="" />
              <div className={styles.teamIdentity}>
                <h3 className={styles.teamName} style={{ color: team.accentColor }}>{team.name}</h3>
                <span className={styles.teamSubtitle}>{team.subtitle}</span>
                <span className={styles.teamRole}>{team.role}</span>
              </div>
              <button
                type="button"
                className={styles.evidenceButton}
                onClick={() => onOpenEvidenceLens?.(team.id)}
                aria-label={`${t("arena.agent_card.view_evidence")} ${team.name}`}
              >
                {t("arena.agent_card.view_evidence")}
              </button>
            </header>
            <HpBar
              hp={hpByTeam[team.id] ?? 100}
              teamColor={team.accentColor}
              teamName={team.name}
              lastHit={lastHitByTeam[team.id]}
            />
            <div className={styles.artifactPreview} data-version={snapshot.version}>
              <header>
                <span>{t("arena.card.artifact")} v{snapshot.version || "—"}</span>
                <strong>{snapshot.artifactReady ? t("arena.card.delivered") : snapshot.working ? t("arena.card.generating") : t("arena.card.recorded")}</strong>
              </header>
              <div className={styles.miniAppFrame}>
                <div className={styles.miniAppNav}><i /><i /><i /></div>
                <strong>{snapshot.previewTitle}</strong>
                <p>{snapshot.previewBody}</p>
                <div className={styles.miniAppMeter}><span style={{ width: `${snapshot.progress}%`, background: team.accentColor }} /></div>
              </div>
            </div>
            <div className={styles.activityPanel} aria-live="polite">
              <div className={styles.activityHeadline}>
                <span className={styles.activityPulse} style={{ color: team.accentColor }} />
                <span>{snapshot.working ? t("arena.card.live_workflow") : t("arena.card.latest_record")}</span>
                <b>{snapshot.statusLine}</b>
              </div>
              <div className={styles.telemetryRow}>
                <span>{t("arena.card.action")}</span>
                <TypewriterText key={`${team.id}-${snapshot.action}`} text={snapshot.action} speedMs={14} />
              </div>
              <div className={styles.telemetryRow}>
                <span>{t("arena.card.observation")}</span>
                <p>{snapshot.observation}</p>
              </div>
              <div className={styles.telemetryRow} data-decision>
                <span>{t("arena.card.decision")}</span>
                <p>{snapshot.decision}</p>
              </div>
              <div className={styles.activityProgress}>
                <span style={{ width: `${snapshot.progress}%`, background: team.accentColor }} />
              </div>
            </div>
            <footer className={styles.teamFooter}>
              <div className={styles.teamMetrics}>
                <span>{t("arena.card.evidence")} <b>{snapshot.evidenceCount}</b></span>
                <span>{t("arena.card.tools")} <b>{snapshot.toolCount}/10</b></span>
                <span>{t("arena.card.status")} <b>{snapshot.working ? t("arena.card.running") : t("arena.card.synced")}</b></span>
              </div>
              <button type="button" className={styles.artifactButton} aria-label={`${t("arena.agent_card.view_artifact")} ${team.name}`} onClick={() => onOpenArtifact?.(team.id)}>
                {t("arena.agent_card.view_artifact")}
              </button>
            </footer>
          </article>
          );
        })}
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.eventStream}>
          <header className={styles.panelHeader}><h3 className={styles.sectionTitle}>{t("arena.event_stream.title")}</h3><span>{events.length} {t("arena.records")}</span></header>
          <ol className={styles.streamList}>
            {eventStream.slice(0, 8).map((event) => (
              <li key={event.id} className={styles.streamItem} data-event-type={event.eventType}>
                <span className={styles.streamTime}>{event.createdAt.slice(11, 19)}</span>
                <span className={styles.streamType}>{eventTypeLabel(event.eventType)}</span>
                <span className={styles.streamTitle}>{event.title}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.currentAttackPanel} data-active={Boolean(currentAttack)}>
          <header className={styles.panelHeader}><h3 className={styles.sectionTitle}>{t("arena.current_attack.title")}</h3><span>{currentAttack ? t("arena.attack.bound") : t("arena.attack.waiting")}</span></header>
          {currentAttack ? <>
            <div className={styles.attackMeta}>
              <strong>{participantName(currentAttack.actorId)}</strong>
              <span className={styles.attackArrow}>→</span>
              <strong>{participantName(currentAttack.targetId)}</strong>
            </div>
            <h4 className={styles.attackTitle}>{currentAttack.title}</h4>
            <TypewriterText text={currentAttack.content} speedMs={18} className={styles.attackContent} />
            <div className={styles.attackEvidence}>{t("arena.card.evidence")} <code>{(currentAttack.rawPayload as { evidence?: string; id?: string } | undefined)?.id ?? currentAttack.id}</code></div>
          </> : <div className={styles.panelEmpty}>{t("arena.attack.empty")}</div>}
        </section>

        <section className={styles.artifactEvolution}>
          <header className={styles.panelHeader}><h3 className={styles.sectionTitle}>{t("arena.evolution.title")}</h3><span>{latestDefense ? t("arena.evolution.v2") : t("arena.evolution.v1")}</span></header>
          <div className={styles.evolutionVersions}>
            <div><span>v1</span><strong>{currentAttack ? t("arena.evolution.risk") : t("arena.evolution.proposal")}</strong><small>{currentAttack?.title ?? t("arena.evolution.wait_attack")}</small></div>
            <i>↓</i>
            <div data-latest><span>v2</span><strong>{latestDefense ? t("arena.evolution.revision_recorded") : t("arena.evolution.wait_defense")}</strong><small>{latestDefense?.title ?? t("arena.evolution.after_attack")}</small></div>
          </div>
          <button type="button" onClick={() => onOpenArtifact?.(championTeamId ?? currentAttack?.targetId ?? "team_viral_v1")}>
            {championTeamId ? t("arena.evolution.open_champion") : t("arena.evolution.open")}
          </button>
        </section>
      </div>

      <section className={styles.battleState}>
        <header className={styles.panelHeader}><h3 className={styles.sectionTitle}>{t("arena.state.title")}</h3><span>{t("arena.state.source")}</span></header>
        <div className={styles.stateTeams}>
          {V052_TEAMS.map((team) => {
            const snapshot = teamSnapshots[team.id];
            return <div key={team.id} className={styles.stateTeam}>
              <img src={team.portrait} alt="" />
              <span><strong>{team.name}</strong><small>{t("arena.agent_card.proof_label")} {hpByTeam[team.id] ?? 100}/100</small></span>
              <span><small>{t("arena.card.evidence")}</small><b>{snapshot.evidenceCount}</b></span>
              <span><small>{t("arena.card.status")}</small><b>{snapshot.working ? t("arena.card.running") : t("arena.card.synced")}</b></span>
            </div>;
          })}
        </div>
      </section>

      <aside className={styles.hostStrip}>
        <ArenaHost round={currentRound} line={replayComplete ? t("arena.host.complete") : undefined} />
        <div className={styles.hostWave} aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ height: `${8 + ((index * 17 + events.length * 11) % 28)}px` }} />)}</div>
      </aside>

      {fatalTakeover && fatalDisplay && (
        <div className={styles.fatalOverlay} role="alert" data-testid="fatal-takeover">
          <div className={styles.fatalBanner}><span>⚠</span>{t("arena.fatal.banner")}<small>{fatalDisplay.payload?.id ?? fatalTakeover.id}</small></div>
          <div className={styles.fatalBody}>
            <div className={styles.fatalSide}>
              <span className={styles.fatalLabel}>{t("arena.fatal.attacker_side")}</span>
              {fatalDisplay.attacker && <img src={fatalDisplay.attacker.portrait} alt="" />}
              <strong>{participantName(fatalTakeover.actorId)}</strong>
              <small>{t("arena.fatal.attacker_meta")}</small>
            </div>
            <div className={styles.fatalCenter}>
              <div className={styles.fatalEventMeta}>
                <span>{fatalDisplay.payload?.severity === "fatal" ? t("arena.fatal.severity_fatal") : t("arena.fatal.severity_high")}</span>
                <strong>{fatalTakeover.title}</strong>
                <code>{fatalDisplay.payload?.id ?? fatalTakeover.id}</code>
              </div>
              <div className={styles.fatalHp}>
                <span className={styles.fatalHpBefore}>{fatalDisplay.before}<small>/100</small></span>
                <span className={styles.fatalHpDelta}>-{fatalDisplay.damage}</span>
                <span className={styles.fatalHpAfter}>{fatalDisplay.after}<small>/100</small></span>
              </div>
              <p className={styles.fatalClaim}>{fatalTakeover.content}</p>
            </div>
            <div className={styles.fatalSide}>
              <span className={styles.fatalLabel}>{t("arena.fatal.defender_side")}</span>
              {fatalDisplay.target && <img src={fatalDisplay.target.portrait} alt="" />}
              <strong>{participantName(fatalTakeover.targetId)}</strong>
              <small>{t("arena.fatal.target_meta")}</small>
            </div>
          </div>
          <div className={styles.fatalDetails}>
            <article><span>{t("arena.fatal.issue_detail")}</span><strong>{fatalDisplay.payload?.evidence ?? fatalTakeover.content}</strong><code>{fatalDisplay.payload?.id ?? fatalTakeover.id}</code></article>
            <article><span>{t("arena.fatal.suggested_impact")}</span><strong>{fatalDisplay.payload?.suggestedFix ?? t("arena.fatal.default_fix")}</strong><small>{t("arena.fatal.defense_note")}</small></article>
          </div>
        </div>
      )}
    </div>
  );
}
