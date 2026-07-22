import { useEffect, useMemo, useState } from "react";
import { buildPlaybackBatches, reduceArenaHp, type BattleEvent } from "@agent-arena/contracts";

const ROUND_DURATION = 2800;

export function useBattleReplay(events: readonly BattleEvent[], autoPlay = true) {
  const batches = useMemo(() => buildPlaybackBatches(events), [events]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing || batches.length < 2) return;
    const timer = window.setTimeout(() => {
      setBatchIndex((current) => (current + 1) % batches.length);
    }, ROUND_DURATION / speed);
    return () => window.clearTimeout(timer);
  }, [batchIndex, batches.length, playing, speed]);

  const visibleEvents = useMemo(
    () => batches.slice(0, batchIndex + 1).flatMap((batch) => batch.events),
    [batchIndex, batches],
  );

  return {
    batch: batches[batchIndex],
    batchIndex,
    batchCount: batches.length,
    playing,
    speed,
    visibleEvents,
    replay: () => { setBatchIndex(0); setPlaying(true); },
    toggle: () => setPlaying((value) => !value),
    seek: (index: number) => setBatchIndex(Math.max(0, Math.min(index, batches.length - 1))),
    cycleSpeed: () => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 2 : 1),
  };
}

export function useArenaState(events: readonly BattleEvent[], teamIds: readonly string[], visibleEvents: readonly BattleEvent[]) {
  const hp = useMemo(() => reduceArenaHp(visibleEvents, teamIds), [teamIds, visibleEvents]);
  const latestByActor = useMemo(() => {
    const result = new Map<string, BattleEvent>();
    for (const event of visibleEvents) if (event.actorId) result.set(event.actorId, event);
    return result;
  }, [visibleEvents]);
  const acceptedAttack = events.find((event) => event.eventType === "defense_created" && event.rawPayload && (event.rawPayload as { acceptedAttack?: boolean }).acceptedAttack);
  return { hp, latestByActor, acceptedAttack };
}
