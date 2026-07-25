import { Link, NavLink, Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { BattleEvent, TeamPassport } from "@agent-arena/contracts";
import { BattleWorkspace } from "./components/BattleWorkspace";
import { BattleArchive } from "./components/BattleArchive";
import { AgentPassport } from "./components/AgentPassport";
import { HomeExperience } from "./components/HomeExperience";
import { LiveArenaPage } from "./components/live-arena-page";
import { ChampionPage } from "./components/champion-page";
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

// Champion passport for the golden BA-2026-0024 storyline.
// Write-locked per docs/DEV-STANDARDS.md §8.
const GOLDEN_CHAMPION: TeamPassport = {
  teamId: "team_viral_v1",
  teamName: "传播设计师",
  accentColor: "var(--team-viral)",
  totalScore: 87,
  scores: {
    feasibility_zh: {
      score: 23, max: 25, completeness: "full_breakdown",
      breakdown: [
        { label: "技术栈成熟", delta: 25 },
        { label: "分享链路集成复杂", delta: -2 },
      ],
    },
    originality: {
      score: 20, max: 25, completeness: "full_breakdown",
      breakdown: [
        { label: "游戏化玩法新", delta: 22 },
        { label: "竞品参考较多", delta: -2 },
      ],
    },
    demoPower: {
      score: 19, max: 25, completeness: "full_breakdown",
      breakdown: [
        { label: "演示流畅性强", delta: 22 },
        { label: "题目覆盖面偏窄", delta: -3 },
      ],
    },
    technicalDepth: {
      score: 13, max: 15, completeness: "linked_evidence",
      breakdown: [{ label: "SVG 降级工程完整", delta: 13 }],
    },
    clarity: {
      score: 8, max: 10, completeness: "linked_evidence",
      breakdown: [{ label: "叙事清晰", delta: 8 }],
    },
    riskControl: {
      score: 4, max: 5, completeness: "linked_evidence",
      breakdown: [{ label: "fatal 修复及时", delta: 4 }],
    },
  },
  strengths: ["演示力最强", "fatal 攻击下恢复力被验证", "传播路径清晰"],
  weaknesses: ["题目技术深度一般", "题库规模偏小"],
  improvementSuggestions: ["补强测试覆盖", "接入向量检索提升题目多样性"],
  journey: [
    { round: "proposal", eventId: "evt_004", title: "ClashQuiz 提案" },
    { round: "attack", eventId: "evt_008", title: "致命攻击 attack_031" },
    { round: "defense", eventId: "evt_011", title: "防守 defense_041" },
    { round: "patch", eventId: "evt_013", title: "patch_048 降级 SVG" },
    { round: "verify", eventId: "evt_016", title: "test_052 通过" },
    { round: "judging", eventId: "evt_018", title: "冠军 87/100" },
  ],
  evidenceCompleteness: "full_breakdown",
};

const GOLDEN_OTHER_TEAMS = [
  { name: "稳健构建者", score: 78, accentColor: "var(--team-safe)" },
  { name: "架构黑客", score: 84, accentColor: "var(--team-infra)" },
];

function ChampionRoute() {
  const { battleId = "demo" } = useParams();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") ?? "verified_replay") as RuntimeMode;
  const liveIncomplete = mode === "live_runtime";

  return (
    <ChampionPage
      battleId={battleId}
      champion={GOLDEN_CHAMPION}
      otherTeams={GOLDEN_OTHER_TEAMS}
      liveIncomplete={liveIncomplete}
      onBackToArena={() => { window.location.href = `/battle/${battleId}?mode=${mode}`; }}
      onWatchVerified={() => { window.location.href = `/battle/${battleId}?mode=verified_replay`; }}
      onShare={() => {
        void navigator.clipboard?.writeText(window.location.href);
      }}
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
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/battle/:battleId" element={<BattlePage />} />
        <Route path="/battle/:battleId/champion" element={<ChampionRoute />} />
        <Route path="/battles" element={<BattlesPage />} />
        <Route path="/agent/:agentId/passport" element={<PassportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
