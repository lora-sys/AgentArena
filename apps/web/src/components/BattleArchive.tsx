import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildDashboardMetrics, loadBattleArchive, type BattleArchiveItem } from "../data/battle";

export function BattleArchive() {
  const [battles, setBattles] = useState<BattleArchiveItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("30D");
  useEffect(() => { void loadBattleArchive().then(setBattles).catch(() => setBattles([])); }, []);
  const metrics = useMemo(() => buildDashboardMetrics(battles),[battles]);
  const visible = useMemo(() => battles.filter((battle) => (filter === "all" || battle.status === filter) && `${battle.title} ${battle.idea}`.toLowerCase().includes(query.toLowerCase())), [battles, filter, query]);
  return <main className="dashboard-page">
    <header className="dashboard-head"><div><p className="eyebrow">BATTLE DASHBOARD</p><h1>Welcome back, Builder.</h1><p>Every metric below comes from a replayable trial.</p></div><div className="period-tabs" aria-label="Dashboard period">{["7D","30D","90D","ALL"].map((item) => <button className={period===item?"active":""} onClick={() => setPeriod(item)} key={item}>{item}</button>)}</div></header>
    <section className="dashboard-kpis">{[["TOTAL BATTLES",metrics.totalBattles],["COMPLETION RATE",`${metrics.completedRate}%`],["EVIDENCE EVENTS",metrics.evidenceEvents],["AGENTS TESTED",metrics.agentsTested]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{period} VERIFIED WINDOW</small></article>)}</section>
    <section className="dashboard-main"><article className="performance-card"><header><h2>PERFORMANCE SIGNAL</h2><span>EVIDENCE · COMPLETION</span></header><div className="performance-chart">{metrics.series.length ? metrics.series.map((point) => <div key={point.label}><b style={{height:`${Math.min(point.evidence*3,100)}%`}} /><i style={{height:`${point.completion}%`}} /><span>{point.label}</span></div>) : <p>Waiting for the first completed Battle.</p>}</div></article><article className="recent-card"><header><h2>RECENT BATTLES</h2><span>{battles.length}</span></header>{battles.slice(0,4).map((battle) => <Link to={`/battle/${battle.id}`} key={battle.id}><b>{battle.status === "completed" ? "WIN" : "LIVE"}</b><span>{battle.title}</span><small>{battle.eventCount} EVENTS</small></Link>)}</article></section>
    <section className="archive-zone"><header><div><p className="eyebrow">BATTLE ARCHIVE</p><h2>Every result leaves evidence.</h2></div><div className="archive-tools"><div role="group" aria-label="Battle status filter">{["all","completed","live"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item.toUpperCase()}</button>)}</div><input aria-label="Search battles" placeholder="SEARCH BATTLES" value={query} onChange={(event) => setQuery(event.target.value)} /></div></header><div className="archive-list">{visible.map((battle) => <Link className="battle-record" to={`/battle/${battle.id}`} key={battle.id}><div><span className={`status ${battle.status}`}>{battle.status}</span><small>{new Date(battle.updatedAt).toLocaleDateString()}</small></div><h2>{battle.title}</h2><p>{battle.idea}</p><footer><span>WINNER · <b>{battle.winnerName}</b></span><span>{battle.agents.length} AGENTS</span><span>{battle.eventCount} EVENTS</span><strong>OPEN REPLAY →</strong></footer></Link>)}{visible.length === 0 && <div className="empty-state">No battles match this signal.</div>}</div></section>
  </main>;
}
