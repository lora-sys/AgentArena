import { Link, NavLink, Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { BattleEvent, TeamPassport } from "@agent-arena/contracts";
import { HomeExperience } from "./components/HomeExperience";
import { LiveArenaPage, V052_TEAMS } from "./components/live-arena-page";
import { ChampionPage } from "./components/champion-page";
import { ArtifactModal } from "./components/artifact-modal";
import { EvidenceLensModal } from "./components/evidence-lens-modal";
import { ArtifactWorkspace, EvidenceLinks, MiniAppDemo, PatchDiff, TestResultsTable, VersionCompare } from "./components/artifact-tabs";
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

  return <LiveArenaRoute
    battleId={battleId}
    mode={mode}
    forceFatal={searchParams.get("fatal") === "1"}
    completeReplay={searchParams.get("replay") === "complete"}
    replayRequested={searchParams.get("replay") === "1"}
  />;
}

function LiveArenaRoute({ battleId, mode, forceFatal, completeReplay, replayRequested }: { battleId: string; mode: RuntimeMode; forceFatal: boolean; completeReplay: boolean; replayRequested: boolean }) {
  const [events, setEvents] = useState<readonly BattleEvent[] | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [artifactTeamId, setArtifactTeamId] = useState<string | null>(null);
  const [evidenceTeamId, setEvidenceTeamId] = useState<string | null>(null);
  const [replayCursor, setReplayCursor] = useState(0);
  const [replayPaused, setReplayPaused] = useState(false);
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const [liveComplete, setLiveComplete] = useState(false);
  const liveStartedAtRef = useRef(Date.now());
  const liveLatestAtRef = useRef<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (mode === "live_runtime" && !replayRequested) {
      const startedAt = Date.now();
      liveStartedAtRef.current = startedAt;
      liveLatestAtRef.current = null;
      setEvents([]);
      setLiveFailed(false);
      setHeartbeatCount(0);
      setLiveComplete(false);
      const elapsedTimer = window.setInterval(() => setElapsedMs(Date.now() - liveStartedAtRef.current), 250);
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
          const eventTime = Date.parse(event.createdAt);
          if (Number.isFinite(eventTime)) {
            liveStartedAtRef.current = Math.min(liveStartedAtRef.current, eventTime);
            liveLatestAtRef.current = Math.max(liveLatestAtRef.current ?? eventTime, eventTime);
          }
          window.clearTimeout(firstEventTimer);
          setEvents((current) => current?.some((candidate) => candidate.id === event.id) ? current : [...(current ?? []), event]);
        } catch {
          setLiveFailed(true);
          source.close();
        }
      });
      source.addEventListener("heartbeat", () => {
        if (!cancelled) setHeartbeatCount((count) => count + 1);
      });
      source.addEventListener("done", () => {
        if (cancelled) return;
        source.close();
        window.clearInterval(elapsedTimer);
        setElapsedMs(Math.max(0, (liveLatestAtRef.current ?? Date.now()) - liveStartedAtRef.current));
        setLiveComplete(true);
      });
      source.addEventListener("error", () => {
        if (cancelled) return;
        window.clearInterval(elapsedTimer);
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
      if (!cancelled) {
        setEvents(result.events);
        setReplayCursor(completeReplay ? result.events.length : 0);
        setReplayPaused(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [battleId, mode, completeReplay, replayRequested]);

  useEffect(() => {
    const playbackActive = mode === "verified_replay" || replayRequested;
    if (!playbackActive || completeReplay || replayPaused || !events || replayCursor >= events.length) return;
    const visibleEvent = replayCursor > 0 ? events[replayCursor - 1] : undefined;
    const payload = visibleEvent?.rawPayload as { id?: string; severity?: string } | undefined;
    const delay = replayCursor === 0
      ? 250
      : visibleEvent?.eventType === "attack_created" && payload?.severity === "fatal"
        ? 3200
        : visibleEvent?.eventType === "attack_created"
          ? 1500
          : visibleEvent?.eventType === "defense_created"
            ? 1350
            : visibleEvent?.eventType === "score_created"
              ? 1200
              : visibleEvent?.eventType === "champion_selected"
                ? 1200
                : 850;
    const timer = window.setTimeout(() => setReplayCursor((cursor) => Math.min(cursor + 1, events.length)), delay);
    return () => window.clearTimeout(timer);
  }, [completeReplay, events, mode, replayCursor, replayPaused, replayRequested]);

  if (!events) {
    return <main className="battle-page"><p>{t("common.loading")}…</p></main>;
  }

  const returnToVerified = () => {
    window.location.href = `/battle/BA-2026-0024?mode=verified_replay`;
  };
  if (mode === "demo_fallback" || liveFailed) {
    return <LiveAiDegraded onReturnVerified={returnToVerified} />;
  }

  const playbackActive = mode === "verified_replay" || replayRequested;
  const replayEvents = playbackActive && !forceFatal ? events.slice(0, replayCursor) : events;
  const visibleEvents = forceFatal
    ? events.slice(0, Math.max(0, events.findIndex((event) => (event.rawPayload as { id?: string } | undefined)?.id === "defense_041")) + 1)
    : replayEvents;
  const liveWinnerTeamId = mode === "live_runtime"
    ? (visibleEvents.find((event) => event.eventType === "champion_selected")?.rawPayload as { winnerTeamId?: string } | undefined)?.winnerTeamId
    : undefined;
  const selectedArtifactTeam = V052_TEAMS.find((team) => team.id === artifactTeamId);
  const selectedEvidenceTeam = V052_TEAMS.find((team) => team.id === evidenceTeamId);
  const artifactProjection = artifactTeamId
    ? buildLiveArtifactProjection(visibleEvents, artifactTeamId, mode === "live_runtime" ? liveWinnerTeamId : "team_viral_v1")
    : null;
  const goldenChampionArtifactVisible = visibleEvents.some((event) => event.eventType === "artifact_created" && event.round === "artifact_generation");
  const selectedGoldenChampion = mode === "verified_replay" && artifactTeamId === "team_viral_v1" && goldenChampionArtifactVisible;
  const selectedEvidenceChain = evidenceTeamId ? buildLiveEvidenceChain(visibleEvents, evidenceTeamId) : [];
  const liveEvidenceScores = mode === "live_runtime" && evidenceTeamId ? buildLiveScoreDimensions(visibleEvents, evidenceTeamId) : undefined;
  const goldenScoreVisible = visibleEvents.some((event) => event.eventType === "score_created");
  const evidenceCompleteness = mode === "live_runtime"
    ? liveEvidenceScores && selectedEvidenceChain.length > 0 ? "full_breakdown" : selectedEvidenceChain.length > 0 ? "linked_evidence" : "insufficient_evidence"
    : evidenceTeamId === "team_viral_v1" && goldenScoreVisible
      ? "full_breakdown"
      : selectedEvidenceChain.length > 0
        ? "linked_evidence"
        : "insufficient_evidence";

  return (
    <>
      <LiveArenaPage
        battleId={battleId}
        idea={mode === "live_runtime" ? readLiveIdea(events, battleId) : t("app.golden.idea")}
        events={visibleEvents}
        mode={mode}
        elapsedMs={elapsedMs}
        forceFatal={forceFatal}
        replayPaused={replayPaused}
        replayComplete={playbackActive ? events.length > 0 && replayCursor >= events.length : liveComplete}
        replayPlayback={playbackActive}
        championAvailable={visibleEvents.some((event) => event.eventType === "champion_selected")}
        replayProgress={{ current: replayCursor, total: events.length }}
        onToggleReplay={() => setReplayPaused((paused) => !paused)}
        onRestartReplay={() => { setReplayCursor(0); setReplayPaused(false); }}
        onViewChampion={() => { window.location.href = `/battle/${battleId}/champion?mode=${mode}`; }}
        liveHeartbeatCount={heartbeatCount}
        onOpenArtifact={setArtifactTeamId}
        onOpenEvidenceLens={setEvidenceTeamId}
      />
      <ArtifactModal
        open={artifactTeamId !== null}
        onClose={() => setArtifactTeamId(null)}
        teamName={selectedArtifactTeam?.name ?? t("app.team.viral")}
        versionsContent={mode === "live_runtime" || !selectedGoldenChampion
          ? artifactProjection
            ? <>
                <VersionCompare v1Content={artifactProjection.v1Content} v2Content={artifactProjection.v2Content} />
                <MiniAppDemo
                  artifactTitle={artifactProjection.title}
                  artifactSummary={artifactProjection.summary}
                  artifactBadge={artifactProjection.isChampion ? t("artifact.live_mini.badge") : t("artifact.team.badge")}
                />
              </>
            : <p>{t("arena.artifact.pending")}</p>
          : <ArtifactWorkspace v1Content={ARTIFACT_V1} v2Content={ARTIFACT_V2} />}
        patchContent={<PatchDiff diffText={mode === "live_runtime" || !selectedGoldenChampion ? artifactProjection?.patch ?? t("app.patch.empty") : ARTIFACT_PATCH} />}
        testsContent={<TestResultsTable rows={mode === "live_runtime" || !selectedGoldenChampion ? artifactProjection?.tests ?? [] : ARTIFACT_TESTS} />}
        evidenceContent={<EvidenceLinks links={mode === "live_runtime" || !selectedGoldenChampion ? artifactProjection?.evidence ?? [] : ARTIFACT_EVIDENCE} />}
      />
      <EvidenceLensModal
        open={evidenceTeamId !== null}
        onClose={() => setEvidenceTeamId(null)}
        teamName={selectedEvidenceTeam?.name ?? t("app.team.viral")}
        accentColor={selectedEvidenceTeam?.accentColor ?? "var(--team-viral)"}
        completeness={evidenceCompleteness}
        scores={evidenceCompleteness !== "full_breakdown" ? undefined : mode === "live_runtime" ? liveEvidenceScores : GOLDEN_CHAMPION.scores}
        evidenceChain={evidenceCompleteness === "insufficient_evidence" ? [] : selectedEvidenceChain}
        onOpenArtifact={() => {
          const teamId = evidenceTeamId;
          setEvidenceTeamId(null);
          setArtifactTeamId(teamId);
        }}
      />
    </>
  );
}

export function readLiveIdea(events: readonly BattleEvent[], battleId: string): string {
  const persistedIdea = (events.find((event) => event.eventType === "brief_created")?.rawPayload as { idea?: string } | undefined)?.idea;
  if (persistedIdea?.trim()) return persistedIdea.trim();
  try {
    return window.sessionStorage.getItem(`agent-arena:idea:${battleId}`) ?? t("app.live.default_idea");
  } catch {
    return t("app.live.default_idea");
  }
}

function eventBelongsToTeam(event: BattleEvent, teamId: string): boolean {
  const payload = event.rawPayload as { teamId?: string; attackerTeamId?: string; targetTeamId?: string; winnerTeamId?: string } | undefined;
  const actorTeamId: Record<string, string> = {
    agent_safe_builder_lead: "team_safe_v1",
    agent_viral_designer_lead: "team_viral_v1",
    agent_infra_hacker_lead: "team_infra_v1",
  };
  return event.actorId === teamId
    || actorTeamId[event.actorId ?? ""] === teamId
    || event.targetId === teamId
    || payload?.teamId === teamId
    || payload?.attackerTeamId === teamId
    || payload?.targetTeamId === teamId
    || payload?.winnerTeamId === teamId
    || (event.eventType === "score_created" && !event.targetId && !payload?.teamId);
}

function eventProducedByTeam(event: BattleEvent, teamId: string): boolean {
  const payload = event.rawPayload as { teamId?: string } | undefined;
  const actorTeamId: Record<string, string> = {
    agent_safe_builder_lead: "team_safe_v1",
    agent_viral_designer_lead: "team_viral_v1",
    agent_infra_hacker_lead: "team_infra_v1",
  };
  return payload?.teamId === teamId || event.actorId === teamId || actorTeamId[event.actorId ?? ""] === teamId;
}

export function buildLiveEvidenceChain(events: readonly BattleEvent[], teamId: string) {
  const typeLabel: Partial<Record<BattleEvent["eventType"], string>> = {
    brief_created: t("app.event.brief"), team_created: t("app.event.team"), proposal_created: t("app.event.proposal"), attack_created: t("app.event.attack"),
    defense_created: t("app.event.defense"), score_created: t("app.event.score"), champion_selected: t("app.event.champion"), artifact_created: t("app.event.artifact"),
    passport_created: t("app.event.passport"), replay_created: t("app.event.replay"), error: t("app.event.error"),
  };
  return events
    .filter((event) => event.eventType !== "commentary_created" && eventBelongsToTeam(event, teamId))
    .map((event) => ({ eventId: event.id, label: `${event.title} · ${typeLabel[event.eventType] ?? t("app.event.generic")}` }))
    .slice(-8);
}

function buildLivePatch(events: readonly BattleEvent[], teamId: string): string {
  const defenses = events.filter((event) => event.eventType === "defense_created" && eventProducedByTeam(event, teamId));
  if (defenses.length === 0) return `${t("app.patch.header")}\n ${t("app.patch.empty")}`;
  return [t("app.patch.ai_header"), ...defenses.map((event) => {
    const payload = event.rawPayload as { acceptedAttack?: boolean; revision?: string; attackId?: string } | undefined;
    return `${payload?.acceptedAttack ? "+" : " "} ${payload?.attackId ?? event.id}：${payload?.revision ?? event.content}`;
  })].join("\n");
}

function buildLiveEvidenceChecks(events: readonly BattleEvent[], teamId: string) {
  const hasProposal = events.some((event) => event.eventType === "proposal_created" && eventProducedByTeam(event, teamId));
  const hasScore = events.some((event) => event.eventType === "score_created" && (event.targetId === teamId || (!event.targetId && !(event.rawPayload as { teamId?: string } | undefined)?.teamId)));
  const hasArtifact = events.some((event) => event.eventType === "artifact_created" && eventProducedByTeam(event, teamId));
  return [
    { id: "check_proposal", name: t("app.check.proposal"), input: t("app.check.event_store"), expected: t("app.check.proposal_expected"), actual: hasProposal ? t("app.check.linked") : t("app.check.unlinked"), passed: hasProposal },
    { id: "check_score", name: t("app.check.score"), input: t("app.check.event_store"), expected: t("app.check.score_expected"), actual: hasScore ? t("app.check.linked") : t("app.check.unlinked"), passed: hasScore },
    { id: "check_artifact", name: t("app.check.artifact"), input: t("app.check.event_store"), expected: t("app.check.artifact_expected"), actual: hasArtifact ? t("app.check.linked") : t("app.check.unlinked"), passed: hasArtifact },
  ];
}

export type LiveArtifactProjection = {
  teamId: string;
  isChampion: boolean;
  title: string;
  summary: string;
  v1Content: string;
  v2Content: string;
  patch: string;
  tests: ReturnType<typeof buildLiveEvidenceChecks>;
  evidence: ReturnType<typeof buildLiveEvidenceChain>;
};

export function buildLiveArtifactProjection(events: readonly BattleEvent[], teamId: string, winnerTeamId?: string): LiveArtifactProjection | null {
  const proposalEvent = events.find((event) => event.eventType === "proposal_created" && eventProducedByTeam(event, teamId));
  if (!proposalEvent) return null;
  const defenseEvent = [...events].reverse().find((event) => event.eventType === "defense_created" && eventProducedByTeam(event, teamId));
  const scoreEvent = [...events].reverse().find((event) => event.eventType === "score_created" && event.targetId === teamId);
  const artifactEvent = [...events].reverse().find((event) => event.eventType === "artifact_created" && eventProducedByTeam(event, teamId));
  const proposal = proposalEvent.rawPayload as { productName?: string; oneLiner?: string; technicalHighlight?: string; demoPlan?: string } | undefined;
  const defense = defenseEvent?.rawPayload as { acceptedAttack?: boolean; revision?: string; responseToAttack?: string } | undefined;
  const productName = proposal?.productName ?? proposalEvent.title.replace(/\s*提案$/, "");
  const proposalSummary = proposal?.oneLiner ?? proposalEvent.content;
  const revision = defense?.revision ?? defense?.responseToAttack ?? t("artifact.team.no_revision");
  const scoreSummary = scoreEvent?.content ?? t("artifact.team.no_score");
  const isChampion = winnerTeamId === teamId;
  const title = artifactEvent?.title ?? `${productName} · ${t("artifact.team.snapshot")}`;
  const summary = artifactEvent?.content ?? `${proposalSummary} · ${revision}`;
  const v1Content = [
    `${t("artifact.team.product")}：${productName}`,
    `${t("artifact.team.proposal")}：${proposalSummary}`,
    `${t("artifact.team.technical")}：${proposal?.technicalHighlight ?? t("artifact.team.not_recorded")}`,
    `${t("artifact.team.demo")}：${proposal?.demoPlan ?? t("artifact.team.not_recorded")}`,
  ].join("\n");
  const v2Content = [
    `${t("artifact.team.product")}：${artifactEvent?.title ?? productName}`,
    `${t("artifact.team.revision")}：${revision}`,
    `${t("artifact.team.judge")}：${scoreSummary}`,
    `${t("artifact.team.delivery")}：${artifactEvent ? t("artifact.team.champion_delivered") : t("artifact.team.proposal_snapshot")}`,
  ].join("\n");
  return {
    teamId,
    isChampion,
    title,
    summary,
    v1Content,
    v2Content,
    patch: buildLivePatch(events, teamId),
    tests: buildLiveEvidenceChecks(events, teamId),
    evidence: buildLiveEvidenceChain(events, teamId),
  };
}

export function buildLiveScoreDimensions(events: readonly BattleEvent[], teamId: string): TeamPassport["scores"] | undefined {
  const scoreEvent = events.find((event) => event.eventType === "score_created" && event.targetId === teamId);
  const rawScores = (scoreEvent?.rawPayload as { scores?: Record<string, number> } | undefined)?.scores;
  if (!scoreEvent || !rawScores) return undefined;
  const scaled = (key: string, multiplier: number, max: number) => Math.min(max, Math.round((rawScores[key] ?? 0) * multiplier));
  const dimension = (key: string, multiplier: number, max: number) => ({
    score: scaled(key, multiplier, max), max, completeness: "full_breakdown" as const,
    breakdown: [{ label: t("app.score.judge"), delta: scaled(key, multiplier, max), evidenceEventIds: [scoreEvent.id] }],
  });
  return {
    feasibility_zh: dimension("feasibility", 2.5, 25),
    originality: dimension("novelty", 2, 20),
    demoPower: dimension("demoWow", 2, 20),
    technicalDepth: dimension("technicalDepth", 1.5, 15),
    clarity: dimension("userValue", 1.5, 15),
    riskControl: dimension("longTermPotential", 0.5, 5),
  };
}

const ARTIFACT_V1 = `function renderShareCard(canvas) {\n  return canvas.toDataURL("image/png");\n}`;
const ARTIFACT_V2 = `function renderShareCard(canvas) {\n  if (isLegacySafari()) return renderSvgCard();\n  return canvas.toDataURL("image/png");\n}`;
const ARTIFACT_PATCH = `@@ share-card.ts @@\n- return canvas.toDataURL("image/png");\n+ if (isLegacySafari()) return renderSvgCard();\n+ return canvas.toDataURL("image/png");`;
const ARTIFACT_TESTS = [
  { id: "test_022", name: t("app.golden.test.canvas"), input: "Safari 16.4", expected: t("app.golden.test.share_expected"), actual: "SecurityError", passed: false },
  { id: "test_032", name: t("app.golden.test.modern"), input: "Chrome / Safari 17", expected: t("app.golden.test.share_expected"), actual: t("app.golden.test.success"), passed: true },
  { id: "test_052", name: t("app.golden.test.svg"), input: "Safari 16.4", expected: t("app.golden.test.svg_expected"), actual: t("app.golden.test.fallback_pass"), passed: true },
] as const;
const ARTIFACT_EVIDENCE = [
  { eventId: "evt_008", label: `attack_031 · Safari 16.4 ${t("app.golden.evidence.fatal")}` },
  { eventId: "evt_011", label: `defense_041 · ${t("app.golden.evidence.defense")}` },
  { eventId: "evt_013", label: `patch_048 · SVG ${t("app.golden.evidence.patch")}` },
  { eventId: "evt_016", label: `test_052 · ${t("app.golden.evidence.regression")}` },
] as const;

// Champion passport for the golden BA-2026-0024 storyline.
// Write-locked per docs/DEV-STANDARDS.md §8.
const GOLDEN_CHAMPION: TeamPassport = {
  teamId: "team_viral_v1",
  teamName: t("app.team.viral"),
  accentColor: "var(--team-viral)",
  totalScore: 87,
  scores: {
    feasibility_zh: {
      score: 23, max: 25, completeness: "full_breakdown",
      breakdown: [
        { label: t("app.golden.score.stack"), delta: 25 },
        { label: t("app.golden.score.share_complex"), delta: -2 },
      ],
    },
    originality: {
      score: 20, max: 20, completeness: "full_breakdown",
      breakdown: [
        { label: t("app.golden.score.gameplay"), delta: 22 },
        { label: t("app.golden.score.competition"), delta: -2 },
      ],
    },
    demoPower: {
      score: 19, max: 20, completeness: "full_breakdown",
      breakdown: [
        { label: t("app.golden.score.demo"), delta: 22 },
        { label: t("app.golden.score.coverage"), delta: -3 },
      ],
    },
    technicalDepth: {
      score: 13, max: 15, completeness: "linked_evidence",
      breakdown: [{ label: t("app.golden.score.svg"), delta: 13 }],
    },
    clarity: {
      score: 8, max: 15, completeness: "linked_evidence",
      breakdown: [{ label: t("app.golden.score.narrative"), delta: 8 }],
    },
    riskControl: {
      score: 4, max: 5, completeness: "linked_evidence",
      breakdown: [{ label: t("app.golden.score.fatal"), delta: 4 }],
    },
  },
  strengths: [t("app.golden.strength.demo"), t("app.golden.strength.recovery"), t("app.golden.strength.share")],
  weaknesses: [t("app.golden.weakness.depth"), t("app.golden.weakness.bank")],
  improvementSuggestions: [t("app.golden.improve.tests"), t("app.golden.improve.retrieval")],
  journey: [
    { round: "proposal", eventId: "evt_004", title: `ClashQuiz ${t("app.event.proposal")}` },
    { round: "attack", eventId: "evt_008", title: `${t("app.golden.evidence.fatal")} attack_031` },
    { round: "defense", eventId: "evt_011", title: `${t("app.event.defense")} defense_041` },
    { round: "patch", eventId: "evt_013", title: `patch_048 ${t("app.golden.evidence.patch")} SVG` },
    { round: "verify", eventId: "evt_016", title: `test_052 ${t("app.golden.test.pass")}` },
    { round: "judging", eventId: "evt_018", title: `${t("app.event.champion")} 87/100` },
  ],
  evidenceCompleteness: "full_breakdown",
};

const GOLDEN_OTHER_TEAMS = [
  { name: t("app.team.safe"), score: 78, accentColor: "var(--team-safe)" },
  { name: t("app.team.infra"), score: 84, accentColor: "var(--team-infra)" },
];

function ChampionRoute() {
  const { battleId = "demo" } = useParams();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") ?? "verified_replay") as RuntimeMode;
  if (mode === "live_runtime") return <LiveChampionRoute battleId={battleId} />;
  if (battleId !== "BA-2026-0024") {
    return <ChampionPage
      battleId={battleId}
      champion={GOLDEN_CHAMPION}
      liveIncomplete
      onBackToArena={() => { window.location.href = `/battle/${battleId}?mode=verified_replay&replay=1`; }}
      onWatchVerified={() => { window.location.href = "/battle/BA-2026-0024?mode=verified_replay"; }}
      onBackHome={() => { window.location.href = "/"; }}
    />;
  }

  return (
    <ChampionPage
      battleId={battleId}
      champion={GOLDEN_CHAMPION}
      otherTeams={GOLDEN_OTHER_TEAMS}
      liveIncomplete={false}
      onBackToArena={() => { window.location.href = `/battle/${battleId}?mode=${mode}&replay=1`; }}
      onWatchVerified={() => { window.location.href = `/battle/${battleId}?mode=verified_replay`; }}
      onBackHome={() => { window.location.href = "/"; }}
      onShare={() => {
        void navigator.clipboard?.writeText(window.location.href);
      }}
    />
  );
}

function buildLivePassport(events: readonly BattleEvent[]): { passport: TeamPassport; others: Array<{ name: string; score: number; accentColor: string }> } | null {
  const championEvent = [...events].reverse().find((event) => event.eventType === "champion_selected");
  const winnerTeamId = (championEvent?.rawPayload as { winnerTeamId?: string } | undefined)?.winnerTeamId;
  if (!winnerTeamId) return null;
  const winner = V052_TEAMS.find((team) => team.id === winnerTeamId);
  if (!winner) return null;
  const scoreEvents = events.filter((event) => event.eventType === "score_created");
  const scoreEvent = scoreEvents.find((event) => event.targetId === winnerTeamId);
  const dimensions = buildLiveScoreDimensions(events, winnerTeamId);
  if (!dimensions) return null;
  const totalScore = Object.values(dimensions).reduce((sum, dimension) => sum + dimension.score, 0);
  const comments = (scoreEvent?.rawPayload as { judgeComments?: string[] } | undefined)?.judgeComments ?? [];
  const journey = events.filter((event) => {
    if (event.eventType === "proposal_created" || event.eventType === "defense_created" || event.eventType === "artifact_created") {
      return eventProducedByTeam(event, winnerTeamId);
    }
    if (event.eventType === "attack_created") return eventBelongsToTeam(event, winnerTeamId);
    if (event.eventType === "champion_selected") return eventBelongsToTeam(event, winnerTeamId);
    return false;
  }).slice(-6).map((event) => ({ round: event.round, eventId: event.id, title: event.title }));
  const passport: TeamPassport = {
    teamId: winnerTeamId, teamName: winner.name, accentColor: winner.accentColor, totalScore, scores: dimensions,
    strengths: comments.length > 0 ? comments.slice(0, 3) : [t("app.live.strength")],
    weaknesses: [t("app.live.weakness")],
    improvementSuggestions: [t("app.live.improvement")], journey, evidenceCompleteness: "full_breakdown",
  };
  const others = V052_TEAMS.filter((team) => team.id !== winnerTeamId).map((team) => {
    const event = scoreEvents.find((candidate) => candidate.targetId === team.id);
    const values = Object.values((event?.rawPayload as { scores?: Record<string, number> } | undefined)?.scores ?? {});
    return { name: team.name, score: Math.round(values.reduce((sum, value) => sum + value, 0) / 60 * 100), accentColor: team.accentColor };
  });
  return { passport, others };
}

function LiveChampionRoute({ battleId }: { battleId: string }) {
  const [result, setResult] = useState<ReturnType<typeof buildLivePassport> | undefined>(undefined);
  useEffect(() => { void loadBattleEvents(battleId).then(({ events }) => setResult(buildLivePassport(events))); }, [battleId]);
  if (result === undefined) return <main className="battle-page"><p>{t("common.loading")}…</p></main>;
  if (result === null) return <ChampionPage battleId={battleId} champion={GOLDEN_CHAMPION} liveIncomplete onBackToArena={() => { window.location.href = `/battle/${battleId}?mode=live_runtime&replay=1`; }} onWatchVerified={() => { window.location.href = "/battle/BA-2026-0024?mode=verified_replay"; }} onBackHome={() => { window.location.href = "/"; }} />;
  return <ChampionPage battleId={battleId} champion={result.passport} otherTeams={result.others} onBackToArena={() => { window.location.href = `/battle/${battleId}?mode=live_runtime&replay=1`; }} onBackHome={() => { window.location.href = "/"; }} onShare={() => { void navigator.clipboard?.writeText(window.location.href); }} />;
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
