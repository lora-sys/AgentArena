import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadBattleArchive, type BattleArchiveItem } from "../data/battle";

export function BattleArchive() {
  const [battles, setBattles] = useState<BattleArchiveItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(() => { void loadBattleArchive().then(setBattles).catch(() => setBattles([])); }, []);
  const visible = useMemo(() => battles.filter((battle) => (filter === "all" || battle.status === filter) && `${battle.title} ${battle.idea}`.toLowerCase().includes(query.toLowerCase())), [battles, filter, query]);
  return <main className="archive-page"><header className="page-lead"><p className="eyebrow">BATTLE ARCHIVE</p><h1>Every result leaves evidence.</h1><p>Search completed trials, inspect the winning agent, and replay every claim from the event chain.</p></header><div className="archive-tools"><div role="group" aria-label="Battle status filter">{["all","completed","live"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item.toUpperCase()}</button>)}</div><input aria-label="Search battles" placeholder="SEARCH BATTLES" value={query} onChange={(event) => setQuery(event.target.value)} /></div><section className="archive-list">{visible.map((battle) => <Link className="battle-record" to={`/battle/${battle.id}`} key={battle.id}><div><span className={`status ${battle.status}`}>{battle.status}</span><small>{new Date(battle.updatedAt).toLocaleDateString()}</small></div><h2>{battle.title}</h2><p>{battle.idea}</p><footer><span>WINNER · <b>{battle.winnerName}</b></span><span>{battle.agents.length} AGENTS</span><span>{battle.eventCount} EVENTS</span><strong>OPEN REPLAY →</strong></footer></Link>)}{visible.length === 0 && <div className="empty-state">No battles match this signal.</div>}</section></main>;
}

