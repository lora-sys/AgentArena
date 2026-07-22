"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BattleEvent, CalculatedScore } from "@/arena/schemas/types";
import { assertBattleEventOrder } from "@/lib/battle-event-order";
import { buildPlaybackBatches, getAcceptedHit, reduceArenaHp } from "@/lib/battle-playback";
import { AgentStatusCard, type AgentState } from "./agent-status-card";
import { RoundBanner } from "./round-banner";
import styles from "./battle-replay-player.module.css";

export type BattlePlayerTeam = {
  id: string;
  name: string;
  initials: string;
  color: string;
  subtitle?: string;
};

export type BattleReplayPlayerProps = {
  battleId: string;
  title: string;
  brief?: string;
  teams: readonly BattlePlayerTeam[];
  events: readonly BattleEvent[];
  autoPlay?: boolean;
  variant?: "full" | "hero";
  loop?: boolean;
  timing?: Partial<{ characterMs: number; eventGapMs: number; roundTransitionMs: number }>;
  connectionState?: "static" | "connecting" | "open" | "reconnecting" | "error";
  onPlaybackComplete?: () => void;
};

const DEFAULT_TIMING = { characterMs: 16, eventGapMs: 360, roundTransitionMs: 500 };

const eventState = (event?: BattleEvent): AgentState => {
  if (!event) return "pending";
  return ["proposal_created", "attack_created", "defense_created"].includes(event.eventType)
    ? "streaming"
    : "complete";
};

export function BattleReplayPlayer({
  battleId,
  title,
  brief,
  teams,
  events,
  autoPlay = true,
  variant = "full",
  loop = false,
  timing,
  connectionState = "static",
  onPlaybackComplete,
}: BattleReplayPlayerProps) {
  const playbackTiming = { ...DEFAULT_TIMING, ...timing };
  const batches = useMemo(() => buildPlaybackBatches(events), [events]);
  const [batchIndex, setBatchIndex] = useState(autoPlay ? 0 : Math.max(0, batches.length - 1));
  const [hitEvents, setHitEvents] = useState<BattleEvent[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && events.length > 0) assertBattleEventOrder(events);
  }, [events]);

  useEffect(() => {
    if (!autoPlay || batches.length === 0 || batchIndex >= batches.length) return;
    const batch = batches[batchIndex];
    const maxChars = Math.max(1, ...batch.events.map((event) => event.content.length));
    const next = batches[batchIndex + 1];
    const roundPause = next && next.round !== batch.round ? playbackTiming.roundTransitionMs : 0;
    const duration = maxChars * playbackTiming.characterMs + playbackTiming.eventGapMs + roundPause;
    const timer = window.setTimeout(() => {
      const acceptedDefenseEvents = batch.events.filter(
        (event) => event.eventType === "defense_created" && (event.rawPayload as { acceptedAttack?: boolean })?.acceptedAttack,
      );
      if (acceptedDefenseEvents.length > 0) {
        setHitEvents(acceptedDefenseEvents);
      }
      setBatchIndex((current) => current + 1);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [autoPlay, batchIndex, batches, playbackTiming.characterMs, playbackTiming.eventGapMs, playbackTiming.roundTransitionMs]);

  useEffect(() => {
    if (hitEvents.length === 0) return;
    const timer = window.setTimeout(() => setHitEvents([]), 1100);
    return () => window.clearTimeout(timer);
  }, [hitEvents]);

  useEffect(() => {
    if (batches.length > 0 && batchIndex >= batches.length && !completedRef.current) {
      completedRef.current = true;
      onPlaybackComplete?.();
      if (loop) {
        const timer = window.setTimeout(() => {
          completedRef.current = false;
          setHitEvents([]);
          setBatchIndex(0);
        }, 1200);
        return () => window.clearTimeout(timer);
      }
    }
    return undefined;
  }, [batchIndex, batches.length, loop, onPlaybackComplete]);

  const visibleBatches = autoPlay ? batches.slice(0, Math.min(batchIndex + 1, batches.length)) : batches;
  const visibleEvents = visibleBatches.flatMap((batch) => batch.events);
  const settledEvents = autoPlay ? batches.slice(0, Math.min(batchIndex, batches.length)).flatMap((batch) => batch.events) : visibleEvents;
  const activeBatch = autoPlay && batchIndex < batches.length ? batches[batchIndex] : batches[batches.length - 1];
  const hp = reduceArenaHp(settledEvents, teams.map((team) => team.id));
  const hits = new Map<string, ReturnType<typeof getAcceptedHit>>();
  for (const event of hitEvents) {
    const hit = getAcceptedHit(event, visibleEvents);
    if (hit) hits.set(hit.teamId, hit);
  }

  const scores = visibleEvents
    .filter((event) => event.eventType === "score_created")
    .map((event) => event.rawPayload as CalculatedScore);

  return (
    <section className={`${styles.player} ${variant === "hero" ? styles.hero : ""}`} data-battle-id={battleId} aria-label={`${title} battle replay`}>
      <header className={styles.broadcastHeader}>
        <div><span className={styles.liveDot} /> <strong>LIVE ARENA</strong></div>
        <p>{brief ?? title}</p>
        <span className={styles.connection}>{connectionState}</span>
      </header>

      {activeBatch ? <RoundBanner round={activeBatch.round} index={activeBatch.roundIndex} /> : null}

      <div className={styles.stage}>
        {teams.map((team) => {
          const latest = [...visibleEvents].reverse().find((event) => event.actorId === team.id);
          const active = activeBatch?.events.find((event) => event.actorId === team.id);
          const hit = hits.get(team.id) ?? undefined;
          const score = scores.find((candidate) => candidate.teamId === team.id)?.totalScore;
          const textRound = activeBatch && ["proposal_round", "cross_attack_round", "defense_round"].includes(activeBatch.round);
          const cardState: AgentState = active
            ? eventState(active)
            : textRound && latest
              ? "streaming"
              : latest
                ? "complete"
                : "pending";
          return (
            <div key={team.id} className={styles.fighterShell} style={{ "--fighter-color": team.color } as React.CSSProperties}>
              <div className={styles.identity}><span>{team.initials}</span><small>{team.subtitle}</small></div>
              <AgentStatusCard
                teamId={team.id}
                teamName={team.name}
                state={cardState}
                streamedText={(active ?? latest)?.content ?? ""}
                streamRunKey={active?.id}
                score={score}
                hp={hp[team.id] ?? 100}
                teamColor={team.color}
                justHit={hit ?? undefined}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.protocolLine} aria-live="polite">
        <span>{String(visibleEvents.length).padStart(2, "0")} EVENTS VERIFIED</span>
        <span>{activeBatch?.round.replaceAll("_", " ") ?? "STANDBY"}</span>
      </div>
    </section>
  );
}
