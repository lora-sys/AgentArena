import { useCallback, useEffect, useMemo, useState } from "react";
import type { BattleEvent } from "@agent-arena/contracts";
import { loadBattleEvents, type BattleEventsResult } from "../data/battle";
import { ArenaStage } from "./ArenaStage";
import { RuntimeModeBadge, modeFromSource, normalizeMode, type RuntimeMode } from "./runtime-mode-badge";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { t } from "../i18n/zh";
import { VERIFIED_SHOWCASE_ID } from "../data/verified-showcase";

type BattleView = "live" | "result" | "replay";

export function BattleWorkspace({ battleId }: { battleId: string }) {
  const [battle, setBattle] = useState<BattleEventsResult | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<readonly BattleEvent[]>([]);
  const [view, setView] = useState<BattleView>("live");
  const [selected, setSelected] = useState<BattleEvent | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let current = true;
    setBattle(null);
    setVisibleEvents([]);
    setSelected(null);
    void loadBattleEvents(battleId).then((result) => { if (current) setBattle(result); });
    return () => { current = false; };
  }, [battleId]);
  const handleProgress = useCallback((events: readonly BattleEvent[]) => setVisibleEvents(events), []);
  const events = battle?.events ?? [];
  const replayEvents = useMemo(() => events.filter((event) => ["proposal_created", "attack_created", "defense_created", "artifact_created", "score_created", "champion_selected"].includes(event.eventType)), [events]);
  const champion = useMemo(() => events.find((event) => event.eventType === "champion_selected"), [events]);
  useEffect(() => {
    const eventId = searchParams.get("event");
    if (eventId && events.length) setSelected(events.find((event) => event.id === eventId) ?? null);
  }, [events, searchParams]);
  useEffect(() => {
    const requestedView = searchParams.get("view");
    if (requestedView === "live" || requestedView === "result" || requestedView === "replay") setView(requestedView);
  }, [searchParams]);

  const returnToVerified = useCallback(() => {
    if (battleId !== VERIFIED_SHOWCASE_ID) {
      navigate(`/battle/${VERIFIED_SHOWCASE_ID}?mode=verified_replay`);
      return;
    }
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("mode", "verified_replay");
      return next;
    }, { replace: true });
  }, [battleId, navigate, setSearchParams]);

  if (!battle) return <section className="battle-loading"><span>{t("arena.loading")}</span><i /></section>;

  // 运行时模式：优先 URL ?mode=，否则由数据源推导
  const runtimeMode = searchParams.get("mode") ? normalizeMode(searchParams.get("mode")) : modeFromSource(battle.source);

  return <section className="battle-workspace">
    <header className="workspace-bar">
      <div><RuntimeModeBadge mode={runtimeMode} /></div>
      <nav aria-label="战斗视图">
        {(["live", "result", "replay"] as const).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{t(`arena.view.${item}` as "arena.view.live" | "arena.view.result" | "arena.view.replay")}</button>)}
      </nav>
    </header>

    {view === "result" ? <ResultPanel champion={champion} events={events} /> : view === "replay" ? <ReplayWorkspace events={replayEvents} allEvents={events} battleId={battleId} runtimeMode={runtimeMode} onReturnVerified={returnToVerified} onProgress={handleProgress} onSelect={setSelected} /> : <div className="battle-grid">
      <ArenaStage battleId={battleId} events={replayEvents} runtimeMode={runtimeMode} onReturnVerified={returnToVerified} onProgress={handleProgress} onFatalEvidence={setSelected} />
      <EvidenceLog events={visibleEvents} onSelect={setSelected} />
    </div>}
    <EvidenceDrawer event={selected} onClose={() => setSelected(null)} />
  </section>;
}

function ReplayWorkspace({ events, allEvents, battleId, runtimeMode, onReturnVerified, onProgress, onSelect }: { events: readonly BattleEvent[]; allEvents: readonly BattleEvent[]; battleId: string; runtimeMode: RuntimeMode; onReturnVerified: () => void; onProgress: (events: readonly BattleEvent[]) => void; onSelect: (event: BattleEvent) => void }) {
  const [inspection, setInspection] = useState<"timeline"|"graph"|"log">("timeline");
  const attacks = allEvents.filter((event) => event.eventType === "attack_created");
  const defenses = allEvents.filter((event) => event.eventType === "defense_created");
  const accepted = defenses.filter((event) => (event.rawPayload as { acceptedAttack?: boolean } | undefined)?.acceptedAttack);
  const critical = attacks.filter((event) => (event.rawPayload as { severity?: string } | undefined)?.severity === "high");
  const damage = accepted.reduce((total, defense) => { const attackId = (defense.rawPayload as { attackId?: string }).attackId; const attack = attacks.find((item) => (item.rawPayload as { id?: string } | undefined)?.id === attackId); const severity = (attack?.rawPayload as { severity?: string } | undefined)?.severity; return total + (severity === "high" ? 30 : severity === "medium" ? 15 : 5); },0);
  return <section className="replay-workspace"><aside className="replay-rounds"><header>REPLAY</header>{["PROPOSAL","ATTACK","DEFENSE","SCORING","CHAMPION"].map((round,index) => <button key={round}><b>0{index+1}</b><span>{round}</span></button>)}</aside><div className="replay-center"><ArenaStage battleId={battleId} events={events} runtimeMode={runtimeMode} onReturnVerified={onReturnVerified} onProgress={onProgress} /><div className="replay-stats">{[["ATTACKS",attacks.length],["ACCEPTED",accepted.length],["REJECTED",defenses.length-accepted.length],["CRITICAL",critical.length],["DAMAGE",damage],["AVG SEVERITY",critical.length ? "HIGH" : "MED"]].map(([label,value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></div><aside className="replay-inspector"><nav>{(["timeline","graph","log"] as const).map((tab) => <button className={inspection===tab?"active":""} onClick={() => setInspection(tab)} key={tab}>{tab.toUpperCase()}</button>)}</nav>{inspection === "timeline" && <EvidenceLog events={allEvents} onSelect={onSelect} />}{inspection === "graph" && <div className="damage-graph">{attacks.map((event,index) => <div key={event.id}><span>{index+1}</span><i style={{height:`${((event.rawPayload as {severity?:string})?.severity === "high" ? 100 : (event.rawPayload as {severity?:string})?.severity === "medium" ? 55 : 24)}%`}} /><b>{(event.rawPayload as {severity?:string})?.severity ?? "low"}</b></div>)}</div>}{inspection === "log" && <div className="raw-log">{allEvents.map((event) => <button key={event.id} onClick={() => onSelect(event)}><span>{event.sequence?.toString().padStart(2,"0")}</span>{event.eventType}</button>)}</div>}</aside></section>;
}

function EvidenceLog({ events, onSelect }: { events: readonly BattleEvent[]; onSelect: (event: BattleEvent) => void }) {
  return <aside className="evidence-log"><header><span>{t("arena.evidence_chain.title")}</span><b>{events.length.toString().padStart(2, "0")}</b></header><div className="evidence-list">
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
  return <div className="evidence-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="evidence-title" className="evidence-drawer"><header><div><span>{event.id} · {event.round}</span><h2 id="evidence-title">{event.title}</h2></div><button onClick={onClose}>{t("common.close")}</button></header><div className="drawer-content"><section><h3>{t("evidence.event_summary")}</h3><p>{event.content}</p></section>{payload?.severity && <section><h3>{t("evidence.attack_signal")}</h3><p><b>{payload.severity.toUpperCase()}</b>{payload.evidence ?? t("evidence.recorded")}</p></section>}{typeof payload?.acceptedAttack === "boolean" && <section><h3>{t("evidence.defense_verdict")}</h3><p><b>{payload.acceptedAttack ? "已接受" : "已驳回"}</b>{payload.responseToAttack}<br />{payload.revision}</p></section>}<section><h3>{t("evidence.verified_payload")}</h3><pre>{event.rawPayload ? JSON.stringify(event.rawPayload,null,2) : t("evidence.no_payload")}</pre></section></div></section></div>;
}

function ResultPanel({ champion, events }: { champion?: BattleEvent; events: readonly BattleEvent[] }) {
  const accepted = events.filter((event) => event.eventType === "defense_created" && (event.rawPayload as { acceptedAttack?: boolean } | undefined)?.acceptedAttack);
  return <section className="result-panel"><p className="eyebrow">BATTLE COMPLETE</p><h1>{champion?.title ?? "RESULT SEALED"}</h1><p>{champion?.content ?? "The champion is derived from the recorded score evidence."}</p><div className="result-stats"><div><strong>{events.length}</strong><span>EVIDENCE EVENTS</span></div><div><strong>{accepted.length}</strong><span>ACCEPTED ATTACKS</span></div><div><strong>5</strong><span>ROUNDS REPLAYABLE</span></div></div>{champion && <Link className="result-champion-link" to={`/battle/${champion.battleId}/champion`}>{t("champion.reveal.open")}</Link>}<button type="button" onClick={() => window.location.reload()}>REPLAY FROM START</button></section>;
}
