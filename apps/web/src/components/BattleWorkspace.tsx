import { useCallback, useEffect, useMemo, useState } from "react";
import type { BattleEvent } from "@agent-arena/contracts";
import { loadBattleEvents, type BattleEventsResult } from "../data/battle";
import { ArenaStage } from "./ArenaStage";
import { useSearchParams } from "react-router-dom";

type BattleView = "live" | "result" | "replay";

export function BattleWorkspace({ battleId }: { battleId: string }) {
  const [battle, setBattle] = useState<BattleEventsResult | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<readonly BattleEvent[]>([]);
  const [view, setView] = useState<BattleView>("live");
  const [selected, setSelected] = useState<BattleEvent | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => { void loadBattleEvents(battleId).then(setBattle); }, [battleId]);
  const handleProgress = useCallback((events: readonly BattleEvent[]) => setVisibleEvents(events), []);
  const events = battle?.events ?? [];
  const replayEvents = useMemo(() => events.filter((event) => ["proposal_created", "attack_created", "defense_created", "score_created", "champion_selected"].includes(event.eventType)), [events]);
  const champion = useMemo(() => events.find((event) => event.eventType === "champion_selected"), [events]);
  useEffect(() => {
    const eventId = searchParams.get("event");
    if (eventId && events.length) setSelected(events.find((event) => event.id === eventId) ?? null);
  }, [events, searchParams]);

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
      <EvidenceLog events={view === "replay" ? events : visibleEvents} onSelect={setSelected} />
    </div>}
    <EvidenceDrawer event={selected} onClose={() => setSelected(null)} />
  </section>;
}

function EvidenceLog({ events, onSelect }: { events: readonly BattleEvent[]; onSelect: (event: BattleEvent) => void }) {
  return <aside className="evidence-log"><header><span>EVIDENCE CHAIN</span><b>{events.length.toString().padStart(2, "0")}</b></header><div className="evidence-list">
    {[...events].reverse().map((event) => <button type="button" onClick={() => onSelect(event)} key={event.id}><i /><div><span>{event.eventType.replaceAll("_", " ")}</span><strong>{event.title}</strong><small>{event.actorId ?? "arena system"} · {event.round}</small></div></button>)}
    {events.length === 0 && <p>Waiting for the first verified event…</p>}
  </div></aside>;
}

function EvidenceDrawer({ event, onClose }: { event: BattleEvent | null; onClose: () => void }) {
  useEffect(() => {
    const close = (keyboard: KeyboardEvent) => { if (keyboard.key === "Escape") onClose(); };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  if (!event) return null;
  const payload = event.rawPayload as { severity?: string; acceptedAttack?: boolean; evidence?: string; responseToAttack?: string; revision?: string } | undefined;
  return <div className="evidence-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="evidence-title" className="evidence-drawer"><header><div><span>{event.id} · {event.round}</span><h2 id="evidence-title">{event.title}</h2></div><button onClick={onClose}>ESC</button></header><div className="drawer-content"><section><h3>EVENT SUMMARY</h3><p>{event.content}</p></section>{payload?.severity && <section><h3>ATTACK SIGNAL</h3><p><b>{payload.severity.toUpperCase()}</b>{payload.evidence ?? "Evidence recorded in the battle chain."}</p></section>}{typeof payload?.acceptedAttack === "boolean" && <section><h3>DEFENSE VERDICT</h3><p><b>{payload.acceptedAttack ? "ACCEPTED" : "REJECTED"}</b>{payload.responseToAttack}<br />{payload.revision}</p></section>}<section><h3>VERIFIED PAYLOAD</h3><pre>{event.rawPayload ? JSON.stringify(event.rawPayload,null,2) : "No additional payload."}</pre></section></div></section></div>;
}

function ResultPanel({ champion, events }: { champion?: BattleEvent; events: readonly BattleEvent[] }) {
  const accepted = events.filter((event) => event.eventType === "defense_created" && (event.rawPayload as { acceptedAttack?: boolean } | undefined)?.acceptedAttack);
  return <section className="result-panel"><p className="eyebrow">BATTLE COMPLETE</p><h1>{champion?.title ?? "RESULT SEALED"}</h1><p>{champion?.content ?? "The champion is derived from the recorded score evidence."}</p><div className="result-stats"><div><strong>{events.length}</strong><span>EVIDENCE EVENTS</span></div><div><strong>{accepted.length}</strong><span>ACCEPTED ATTACKS</span></div><div><strong>5</strong><span>ROUNDS REPLAYABLE</span></div></div><button type="button" onClick={() => window.location.reload()}>REPLAY FROM START</button></section>;
}
