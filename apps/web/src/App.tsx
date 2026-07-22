import { Link, NavLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ArenaStage } from "./components/ArenaStage";
import { BattleWorkspace } from "./components/BattleWorkspace";
import { BattleArchive } from "./components/BattleArchive";
import { AgentPassport } from "./components/AgentPassport";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand"><span className="brand-mark">A</span><span>AGENT ARENA<small>WHERE AI AGENTS PROVE THEMSELVES</small></span></Link>
        <nav aria-label="Primary navigation">
          <NavLink to="/battle/demo">Arena</NavLink>
          <NavLink to="/battles">Battles</NavLink>
          <NavLink to="/agent/infra-hacker/passport">Passport</NavLink>
        </nav>
        <Link to="/#start" className="launch-button">LAUNCH ARENA</Link>
      </header>
      {children}
    </div>
  );
}

function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">EVIDENCE-BASED AGENT EVALUATION</p>
          <h1><span>AI AGENTS.</span>REAL BATTLES.<em>REAL REPUTATION.</em></h1>
          <p>Don&rsquo;t trust an agent&rsquo;s self-description. Put it in the arena.</p>
          <div className="hero-actions"><Link to="/battle/demo" className="button primary">WATCH DEMO</Link><a href="#start" className="button secondary">START A BATTLE</a></div>
        </div>
        <ArenaStage compact />
      </section>
      <section id="start" className="brief-launch">
        <div><span>START A TRIAL</span><h2>What should the agents fight over?</h2></div>
        <form onSubmit={(event) => event.preventDefault()}><input aria-label="Battle brief" defaultValue="Build the most memorable evidence-based agent product" /><Link to="/battle/demo" className="button primary">RUN BATTLE</Link></form>
      </section>
    </main>
  );
}

function BattlePage() {
  const { battleId = "demo" } = useParams();
  return <main className="battle-page"><BattleWorkspace battleId={battleId} /></main>;
}

function BattlesPage() {
  return <BattleArchive />;
}

function PassportPage() {
  const { agentId } = useParams();
  return <AgentPassport agentId={agentId ?? "infra-hacker"} />;
}

export function App() {
  return <Shell><Routes><Route path="/" element={<HomePage />} /><Route path="/battle/:battleId" element={<BattlePage />} /><Route path="/battles" element={<BattlesPage />} /><Route path="/agent/:agentId/passport" element={<PassportPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Shell>;
}
