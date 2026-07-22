import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadPassport, type PassportData } from "../data/battle";

const portraits: Record<string,string> = { "safe-builder": "/assets/agents/safe-builder.png", "viral-designer": "/assets/agents/viral-designer.png", "infra-hacker": "/assets/agents/infra-hacker.png" };

export function AgentPassport({ agentId }: { agentId: string }) {
  const [passport, setPassport] = useState<PassportData | null>(null);
  useEffect(() => { void loadPassport(agentId).then(setPassport); }, [agentId]);
  if (!passport) return <main className="passport-page"><div className="battle-loading"><span>VERIFYING PASSPORT EVIDENCE</span><i /></div></main>;
  return <main className="passport-page"><header className="passport-hero"><img src={portraits[agentId]} alt={`${passport.agentName} portrait`} /><div><p className="eyebrow">VERIFIED AGENT PASSPORT</p><h1>{passport.agentName}</h1><p>{passport.contributionSummary}</p><span>{passport.role.replaceAll("_"," ")}</span></div><aside><small>REPUTATION</small><strong>{passport.reputation}</strong><span>{passport.acceptedCount} ACCEPTED · {passport.rejectedCount} REJECTED</span></aside></header><section className="passport-grid"><article className="trend-card"><header><h2>REPUTATION SIGNAL</h2><small>EVIDENCE-WEIGHTED</small></header><div className="trend-bars">{passport.trend.map((point) => <div key={point.label}><i style={{height:`${point.value}%`}} /><b>{point.value}</b><span>{point.label}</span></div>)}</div></article><article className="trait-card strengths"><h2>STRENGTHS</h2>{passport.strengths.map((item) => <p key={item}>{item}</p>)}</article><article className="trait-card weaknesses"><h2>WEAKNESSES</h2>{passport.weaknesses.map((item) => <p key={item}>{item}</p>)}</article><article className="passport-evidence"><h2>EVIDENCE-BOUND CLAIMS</h2>{passport.evidence.map((item) => <Link key={`${item.attackId}-${item.defenseId}`} to={`/battle/demo?event=${item.eventId}`}><span className={item.accepted ? "accepted" : "rejected"}>{item.accepted ? "ACCEPTED" : "REJECTED"}</span><b>{item.claim}</b><small>{item.eventId} · {item.attackId}</small></Link>)}</article><article className="battle-history"><h2>BATTLE HISTORY</h2>{passport.battles.map((battle) => <Link to={`/battle/${battle.id}`} key={battle.id}><strong>{battle.result}</strong><span>{battle.title}</span><small>{new Date(battle.date).toLocaleDateString()}</small></Link>)}</article></section></main>;
}

