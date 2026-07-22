import { useCallback, useEffect, useMemo, useState } from "react";
import type { BattleEvent } from "@agent-arena/contracts";
import { loadBattleEvents, type BattleEventsResult } from "../data/battle";
import { ArenaStage } from "./ArenaStage";

type BattleView = "live" | "result" | "replay";

export function BattleWorkspace({ battleId }: { battleId: string }) {
  const [battle, setBattle] = useState<BattleEventsResult | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<readonly BattleEvent[]>([]);
  const [view, setView] = useState<BattleView>("live");

  useEffect(() => { void loadBattleEvents(battleId).then(setBattle); }, [battleId]);
  const handleProgress = useCallback((events: readonly BattleEvent[]) => setVisibleEvents(events), []);
  const events = battle?.events ?? [];
  const replayEvents = useMemo(() => events.filter((event) => ["proposal_created", "attack_created", "defense_created", "score_created", "champion_selected"].includes(event.eventType)), [events]);
  const champion = useMemo(() => events.find((event) => event.eventType === "champion_selected"), [events]);

  if (!battle) return <section className="battle-loading"><span>CONNECTING TO EVENT STORE</span><i /></section>;

  return <section className="battle-workspace">
    <header className="workspace-bar">
      <div><span className={`source-dot ${battle.source}`} />{battle.source === "event-store" ? "EVENT STORE" : battle.source === "fixture" ? "VERIFIED FIXTURE" : "DEMO FALLBACK"}</div>
      <nav aria-label="Battle view">
        {(["live", "result", "replay"] as const).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item.toUpperCase()}</button>)}
      </nav>
    </header>

    {view === "result" ? <ResultPanel champion={champion} events={events} /> : <div className="battle-grid">
      <ArenaStage battleId={battleId} events={replayEvents} onProgress={handleProgress} />
      <EvidenceLog events={view === "replay" ? events : visibleEvents} />
    </div>}
  </section>;
}

function EvidenceLog({ events }: { events: readonly BattleEvent[] }) {
  return <aside className="evidence-log"><header><span>EVIDENCE CHAIN</span><b>{events.length.toString().padStart(2, "0")}</b></header><div className="evidence-list">
    {[...events].reverse().map((event) => <article key={event.id}><i /><div><span>{event.eventType.replaceAll("_", " ")}</span><strong>{event.title}</strong><small>{event.actorId ?? "arena system"} · {event.round}</small></div></article>)}
    {events.length === 0 && <p>Waiting for the first verified event…</p>}
  </div></aside>;
}

function ResultPanel({ champion, events }: { champion?: BattleEvent; events: readonly BattleEvent[] }) {
  const accepted = events.filter((event) => event.eventType === "defense_created" && (event.rawPayload as { acceptedAttack?: boolean } | undefined)?.acceptedAttack);
  return <section className="result-panel"><p className="eyebrow">BATTLE COMPLETE</p><h1>{champion?.title ?? "RESULT SEALED"}</h1><p>{champion?.content ?? "The champion is derived from the recorded score evidence."}</p><div className="result-stats"><div><strong>{events.length}</strong><span>EVIDENCE EVENTS</span></div><div><strong>{accepted.length}</strong><span>ACCEPTED ATTACKS</span></div><div><strong>5</strong><span>ROUNDS REPLAYABLE</span></div></div><button type="button" onClick={() => window.location.reload()}>REPLAY FROM START</button></section>;
}
