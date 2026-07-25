import { Link, NavLink, Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { BattleEvent, TeamPassport } from "@agent-arena/contracts";
import { HomeExperience } from "./components/HomeExperience";
import { LiveArenaPage, V052_TEAMS } from "./components/live-arena-page";
import { ChampionPage } from "./components/champion-page";
import { ArtifactModal } from "./components/artifact-modal";
import { EvidenceLensModal } from "./components/evidence-lens-modal";
import { EvidenceLinks, LiveDegradedCard, MiniAppDemo, PatchDiff, TestResultsTable, VersionCompare } from "./components/artifact-tabs";
import { LiveAiDegraded } from "./components/live-ai-degraded";
import { loadBattleEvents } from "./data/battle";
import { t } from "./i18n";
import type { RuntimeMode } from "./components/runtime-mode-badge";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand"><img className="brand-mark" src="/assets/brand/agent-arena-mark.png" alt="" /><span>AGENT ARENA<small>{t("common.brand_tagline")}</small></span></Link>
        <nav aria-label={t("common.app_tagline")}>
          <NavLink to="/">{t("common.nav.home")}</NavLink>
          <NavLink to="/battle/BA-2026-0024?mode=verified_replay">{t("common.nav.arena")}</NavLink>
          <NavLink to="/battle/BA-2026-0024/champion">{t("common.nav.passport")}</NavLink>
        </nav>
        <Link to="/#live-battle" className="launch-button">{t("common.launch")}</Link>
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

  return <LiveArenaRoute battleId={battleId} mode={mode} forceFatal={searchParams.get("fatal") === "1"} />;
}

function LiveArenaRoute({ battleId, mode, forceFatal }: { battleId: string; mode: RuntimeMode; forceFatal: boolean }) {
  const [events, setEvents] = useState<readonly BattleEvent[] | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [artifactTeamId, setArtifactTeamId] = useState<string | null>(null);
  const [evidenceTeamId, setEvidenceTeamId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (mode === "live_runtime") {
      const startedAt = Date.now();
      setEvents([]);
      setLiveFailed(false);
      const elapsedTimer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
      const source = new EventSource(`/api/battles/${encodeURIComponent(battleId)}/stream`);
      const firstEventTimer = window.setTimeout(() => {
        if (!cancelled) {
          setLiveFailed(true);
          source.close();
        }
      }, 10_000);
      source.addEventListener("battle", (message) => {
        if (cancelled) return;
        try {
          const event = JSON.parse((message as MessageEvent<string>).data) as BattleEvent;
          if (!event.id || !event.eventType || !event.round) throw new Error("Invalid live event");
          window.clearTimeout(firstEventTimer);
          setEvents((current) => [...(current ?? []), event]);
        } catch {
          setLiveFailed(true);
          source.close();
        }
      });
      source.addEventListener("done", () => {
        if (cancelled) return;
        source.close();
        window.location.href = `/battle/${battleId}/champion?mode=live_runtime`;
      });
      source.addEventListener("error", () => {
        if (cancelled) return;
        setLiveFailed(true);
        source.close();
      });
      return () => {
        cancelled = true;
        source.close();
        window.clearInterval(elapsedTimer);
        window.clearTimeout(firstEventTimer);
      };
    }
    void loadBattleEvents(battleId).then((result) => {
      if (!cancelled) setEvents(result.events);
    });
    return () => {
      cancelled = true;
    };
  }, [battleId, mode]);

  if (!events) {
    return <main className="battle-page"><p>{t("common.loading")}…</p></main>;
  }

  const returnToVerified = () => {
    window.location.href = `/battle/BA-2026-0024?mode=verified_replay`;
  };
  if (mode === "demo_fallback" || liveFailed) {
    return <LiveAiDegraded onReturnVerified={returnToVerified} />;
  }

  const visibleEvents = forceFatal
    ? events.slice(0, Math.max(0, events.findIndex((event) => (event.rawPayload as { id?: string } | undefined)?.id === "defense_041")) + 1)
    : events;
  const selectedTeam = V052_TEAMS.find((team) => team.id === (artifactTeamId ?? evidenceTeamId));
  const evidenceCompleteness = mode !== "verified_replay"
    ? "insufficient_evidence"
    : evidenceTeamId === "team_viral_v1"
      ? "full_breakdown"
      : evidenceTeamId === "team_safe_v1"
        ? "linked_evidence"
        : "insufficient_evidence";

  return (
    <>
      <LiveArenaPage
        battleId={battleId}
        idea={mode === "live_runtime" ? readLiveIdea(battleId) : "帮助大学生准备考试的 AI 学习助手"}
        events={visibleEvents}
        mode={mode}
        elapsedMs={elapsedMs}
        forceFatal={forceFatal}
        onOpenArtifact={setArtifactTeamId}
        onOpenEvidenceLens={setEvidenceTeamId}
      />
      <ArtifactModal
        open={artifactTeamId !== null}
        onClose={() => setArtifactTeamId(null)}
        teamName={selectedTeam?.name ?? "传播设计师"}
        versionsContent={mode === "live_runtime" ? <LiveDegradedCard onBackToVerified={returnToVerified} /> : <><VersionCompare v1Content={ARTIFACT_V1} v2Content={ARTIFACT_V2} /><MiniAppDemo /></>}
        patchContent={<PatchDiff diffText={ARTIFACT_PATCH} />}
        testsContent={<TestResultsTable rows={ARTIFACT_TESTS} />}
        evidenceContent={<EvidenceLinks links={ARTIFACT_EVIDENCE} />}
      />
      <EvidenceLensModal
        open={evidenceTeamId !== null}
        onClose={() => setEvidenceTeamId(null)}
        teamName={selectedTeam?.name ?? "传播设计师"}
        accentColor={selectedTeam?.accentColor ?? "var(--team-viral)"}
        completeness={evidenceCompleteness}
        scores={evidenceCompleteness === "insufficient_evidence" ? undefined : GOLDEN_CHAMPION.scores}
        evidenceChain={evidenceCompleteness === "insufficient_evidence" ? [] : ARTIFACT_EVIDENCE.map((item) => item.eventId)}
      />
    </>
  );
}

function readLiveIdea(battleId: string): string {
  try {
    return window.sessionStorage.getItem(`agent-arena:idea:${battleId}`) ?? "实时 AI 创意战";
  } catch {
    return "实时 AI 创意战";
  }
}

const ARTIFACT_V1 = `function renderShareCard(canvas) {\n  return canvas.toDataURL("image/png");\n}`;
const ARTIFACT_V2 = `function renderShareCard(canvas) {\n  if (isLegacySafari()) return renderSvgCard();\n  return canvas.toDataURL("image/png");\n}`;
const ARTIFACT_PATCH = `@@ share-card.ts @@\n- return canvas.toDataURL("image/png");\n+ if (isLegacySafari()) return renderSvgCard();\n+ return canvas.toDataURL("image/png");`;
const ARTIFACT_TESTS = [
  { id: "test_022", name: "Safari Canvas 回归", input: "Safari 16.4", expected: "生成分享卡", actual: "SecurityError", passed: false },
  { id: "test_032", name: "现代浏览器路径", input: "Chrome / Safari 17", expected: "生成分享卡", actual: "生成成功", passed: true },
  { id: "test_052", name: "SVG 降级路径", input: "Safari 16.4", expected: "使用 SVG", actual: "降级通过", passed: true },
] as const;
const ARTIFACT_EVIDENCE = [
  { eventId: "evt_008", label: "attack_031 · Safari 16.4 致命攻击" },
  { eventId: "evt_011", label: "defense_041 · 接受攻击并修复" },
  { eventId: "evt_013", label: "patch_048 · SVG 降级补丁" },
  { eventId: "evt_016", label: "test_052 · 回归通过" },
] as const;

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

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/battle/:battleId" element={<BattlePage />} />
        <Route path="/battle/:battleId/champion" element={<ChampionRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
