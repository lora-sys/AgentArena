import { Link, NavLink, Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { BattleEvent } from "@agent-arena/contracts";
import { BattleWorkspace } from "./components/BattleWorkspace";
import { BattleArchive } from "./components/BattleArchive";
import { AgentPassport } from "./components/AgentPassport";
import { HomeExperience } from "./components/HomeExperience";
import { LiveArenaPage } from "./components/live-arena-page";
import { loadBattleEvents } from "./data/battle";
import { t } from "./i18n";
import type { RuntimeMode } from "./components/runtime-mode-badge";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand"><img className="brand-mark" src="/assets/brand/agent-arena-mark.png" alt="" /><span>AGENT ARENA<small>WHERE AI AGENTS PROVE THEMSELVES</small></span></Link>
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
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") ?? "verified_replay") as RuntimeMode;

  // v0.5.2: use the new LiveArenaPage for the golden BA-2026-0024 storyline
  // and any live_runtime / demo_fallback battles. Legacy battles keep the
  // old BattleWorkspace for backwards compatibility during the migration.
  if (battleId === "BA-2026-0024" || mode !== "verified_replay") {
    return <LiveArenaRoute battleId={battleId} mode={mode} />;
  }
  return <main className="battle-page"><BattleWorkspace battleId={battleId} /></main>;
}

function LiveArenaRoute({ battleId, mode }: { battleId: string; mode: RuntimeMode }) {
  const [events, setEvents] = useState<readonly BattleEvent[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void loadBattleEvents(battleId).then((result) => {
      if (!cancelled) setEvents(result.events);
    });
    return () => {
      cancelled = true;
    };
  }, [battleId]);

  if (!events) {
    return <main className="battle-page"><p>{t("common.loading")}…</p></main>;
  }

  return (
    <LiveArenaPage
      battleId={battleId}
      idea="帮助大学生准备考试的 AI 学习助手"
      events={events}
      mode={mode}
    />
  );
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
