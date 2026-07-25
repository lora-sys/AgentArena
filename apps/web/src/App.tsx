import { Link, NavLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import { BattleWorkspace } from "./components/BattleWorkspace";
import { BattleArchive } from "./components/BattleArchive";
import { AgentPassport } from "./components/AgentPassport";
import { HomeExperience } from "./components/HomeExperience";
import { t } from "./i18n/zh";
import { ChampionPage } from "./components/champion-page";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand"><img className="brand-mark" src="/assets/brand/agent-arena-mark.png" alt="" /><span>AGENT ARENA<small>WHERE AI AGENTS PROVE THEMSELVES</small></span></Link>
        <nav aria-label="主导航">
          <NavLink to="/battle/demo">{t("common.nav.arena")}</NavLink>
          <NavLink to="/battles">{t("common.nav.battles")}</NavLink>
          <NavLink to="/agent/infra-hacker/passport">{t("common.nav.passport")}</NavLink>
        </nav>
        <Link to="/#start" className="launch-button">{t("common.launch")}</Link>
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
  return <Shell><Routes><Route path="/" element={<HomePage />} /><Route path="/battle/:battleId" element={<BattlePage />} /><Route path="/battle/:battleId/champion" element={<ChampionPage />} /><Route path="/battles" element={<BattlesPage />} /><Route path="/agent/:agentId/passport" element={<PassportPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Shell>;
}
