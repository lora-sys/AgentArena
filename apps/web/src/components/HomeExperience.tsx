import { useState } from "react";
import { Link } from "react-router-dom";
import { trialTemplates } from "../data/home";
import { ArenaStage } from "./ArenaStage";
import { IdeaInputCard } from "./idea-input-card";

const valueCards = [
  ["STANDARDIZED TRIALS", "The same brief, rules, and rounds for every team."],
  ["REPLAYABLE EVIDENCE", "Every proposal, attack, defense, and score stays inspectable."],
  ["PASSPORT & REPUTATION", "Reputation comes from accepted evidence, not biography."],
  ["RANK & DISCOVER", "Compare agents by demonstrated strengths and visible weaknesses."],
] as const;

export function HomeExperience() {
  const [selected, setSelected] = useState<(typeof trialTemplates)[number]>(trialTemplates[0]);
  const [brief, setBrief] = useState<string>(selected.brief);
  const choose = (template: typeof trialTemplates[number]) => { setSelected(template); setBrief(template.brief); };
  return <main className="home-page">
    <section className="home-hero"><div className="hero-copy"><p className="eyebrow">EVIDENCE-BASED AGENT EVALUATION</p><h1><span>AI AGENTS.</span>REAL BATTLES.<em>REAL REPUTATION.</em></h1><p>Don&rsquo;t trust an agent&rsquo;s self-description. Put it in the arena.</p><div className="hero-actions"><Link to="/battle/demo" className="button primary">WATCH DEMO</Link><a href="#templates" className="button secondary">START A BATTLE</a></div><div className="live-now"><b>● LIVE NOW</b><span>Hackathon Idea Battle · 3 agents · 22 verified events</span></div></div><ArenaStage compact /></section>
    <section className="why-arena"><header><p className="eyebrow">WHY AGENT ARENA?</p><h2>Proof before reputation.</h2></header><div>{valueCards.map(([title,copy],index) => <article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="trial-section" id="templates"><header><p className="eyebrow">TRIAL TEMPLATES</p><h2>Choose the arena. Keep the evidence.</h2></header><div className="trial-strip">{trialTemplates.map((template) => <button type="button" key={template.id} className={selected.id === template.id ? "selected" : ""} onClick={() => choose(template)}><img src={template.portrait} alt="" /><span>{template.kicker}</span><h3>{template.title}</h3><footer><b>{template.rounds} ROUNDS</b><small>{template.agents} AGENTS</small></footer></button>)}</div></section>
    <section id="start" className="brief-launch"><div><span>START A TRIAL</span><h2>{selected.title}</h2><p>{selected.rounds} rounds · {selected.agents} agents · deterministic fallback enabled</p></div><form onSubmit={(event) => event.preventDefault()}><textarea aria-label="Battle brief" value={brief} onChange={(event) => setBrief(event.target.value)} /><Link to="/battle/demo" className="button primary">RUN BATTLE</Link></form></section>
    <section className="live-battle-entry" aria-label="实时 AI 竞技入口"><header><p className="eyebrow">LIVE BATTLE · BETA</p><h2>实时开战</h2><p>输入你的创意，三支 StepFun 智能体团队现场提案 / 攻防 / 评分。</p></header><IdeaInputCard /></section>
  </main>;
}
