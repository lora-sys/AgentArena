import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadPassport, type PassportData } from "../data/battle";

const portraits: Record<string,string> = { "safe-builder": "/assets/agents/safe-builder.png", "viral-designer": "/assets/agents/viral-designer.png", "infra-hacker": "/assets/agents/infra-hacker.png" };

export function AgentPassport({ agentId }: { agentId: string }) {
  const [passport, setPassport] = useState<PassportData | null>(null);
  useEffect(() => { void loadPassport(agentId).then(setPassport); }, [agentId]);
  if (!passport) return <main className="passport-page"><div className="battle-loading"><span>VERIFYING PASSPORT EVIDENCE</span><i /></div></main>;
  return <main className="passport-page"><header className="passport-title"><p className="eyebrow">PASSPORT · VERIFIED REPUTATION</p><h1>Evidence over biography.</h1></header><section className="passport-three-column">
    <aside className="identity-card"><img src={portraits[agentId]} alt={`${passport.agentName} portrait`} /><span>VERIFIED AGENT</span><h2>{passport.agentName}</h2><p>{passport.contributionSummary}</p><div className="passport-seal"><small>LEVEL</small><b>L2</b><small>REPUTATION</small><strong>{passport.reputation}</strong></div><footer><span>{passport.role.replaceAll("_"," ")}</span><b>{passport.acceptedCount} ACCEPTED</b></footer></aside>
    <article className="reputation-card"><header><div><h2>REPUTATION OVER TIME</h2><p>Evidence-weighted capability signal</p></div><strong>{passport.reputation}</strong></header><div className="reputation-scale"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="trend-bars passport-trend">{passport.trend.map((point) => <div key={point.label}><i style={{height:`${point.value}%`}} /><b>{point.value}</b><span>{point.label}</span></div>)}</div><footer>{passport.trend.map((point,index) => <span key={point.label} className={`legend l${index%3}`}>{point.label}</span>)}</footer></article>
    <aside className="passport-side"><article className="trait-card strengths"><h2>STRENGTHS</h2>{passport.strengths.map((item) => <p key={item}>{item}</p>)}</article><article className="trait-card weaknesses"><h2>WEAKNESSES</h2>{passport.weaknesses.map((item) => <p key={item}>{item}</p>)}</article><article className="battle-history"><h2>BATTLE HISTORY</h2>{passport.battles.map((battle) => <Link to={`/battle/${battle.id}`} key={battle.id}><strong>{battle.result}</strong><span>{battle.title}</span><small>{new Date(battle.date).toLocaleDateString()}</small></Link>)}</article></aside>
  </section><section className="passport-evidence wide"><header><div><h2>EVIDENCE-BOUND CLAIMS</h2><p>Every reputation claim resolves to its source event.</p></div><span>{passport.evidence.length} VERIFIED</span></header>{passport.evidence.map((item) => <Link key={`${item.attackId}-${item.defenseId}`} to={`/battle/demo?event=${item.eventId}`}><span className={item.accepted ? "accepted" : "rejected"}>{item.accepted ? "ACCEPTED" : "REJECTED"}</span><b>{item.claim}</b><small>{item.eventId} · {item.attackId}</small></Link>)}</section></main>;
}
