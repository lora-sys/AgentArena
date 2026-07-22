import { Link, NavLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import { BattleWorkspace } from "./components/BattleWorkspace";
import { BattleArchive } from "./components/BattleArchive";
import { AgentPassport } from "./components/AgentPassport";
import { HomeExperience } from "./components/HomeExperience";

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
  return <HomeExperience />;
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
