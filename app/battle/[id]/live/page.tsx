"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Clock3,
  Loader2,
  Play,
  Quote,
  Radio,
  RefreshCw,
  ShieldCheck,
  Swords,
  Trophy,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { BattleEvent } from "@/arena";
import { AppShell } from "@/components/app-shell";
import { connectSse, type SseClientHandle } from "@/lib/sse-client";
import type { Team } from "@/lib/types";

/* ─── State ──────────────────────────────────────────────────────────────── */

type ConnectionStatus = "connecting" | "open" | "reconnecting" | "error";

type LiveState = {
  events: BattleEvent[];
  invalidCount: number;
  status: ConnectionStatus;
};

type LiveAction =
  | { type: "event"; event: BattleEvent }
  | { type: "invalid" }
  | { type: "status"; status: ConnectionStatus }
  | { type: "reset" };

const initialLiveState: LiveState = {
  events: [],
  invalidCount: 0,
  status: "connecting",
};

const liveReducer = (state: LiveState, action: LiveAction): LiveState => {
  switch (action.type) {
    case "event":
      return { ...state, events: [...state.events, action.event] };
    case "invalid":
      return { ...state, invalidCount: state.invalidCount + 1 };
    case "status":
      return { ...state, status: action.status };
    case "reset":
      return initialLiveState;
    default:
      return state;
  }
};

/* ─── Round Timeline ─────────────────────────────────────────────────────── */

const ROUND_ORDER: { key: string; label: string }[] = [
  { key: "briefing", label: "Briefing" },
  { key: "proposal_round", label: "Propose" },
  { key: "cross_attack_round", label: "Attack" },
  { key: "defense_round", label: "Defense" },
  { key: "judging_round", label: "Judging" },
  { key: "artifact_generation", label: "Artifacts" },
  { key: "replay_generation", label: "Passport" },
  { key: "completed", label: "Done" },
];

const deriveCurrentRound = (events: BattleEvent[]): string => {
  if (events.length === 0) return "briefing";
  return events[events.length - 1].round;
};

const RoundTimeline = ({ currentRound }: { currentRound: string }) => {
  const activeIndex = ROUND_ORDER.findIndex((r) => r.key === currentRound);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <nav aria-label="Battle round timeline" className="round-timeline">
      <ol className="round-rail">
        {ROUND_ORDER.map((step, index) => {
          const isActive = step.key === currentRound;
          const isPast = activeIndex > -1 && index < activeIndex;
          return (
            <li
              key={step.key}
              className={`round-step ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="round-dot" aria-hidden="true" />
              <span className="round-label">{step.label}</span>
              {reduceMotion ? null : (
                <span
                  className="round-progress"
                  style={{
                    width: isActive ? "60%" : isPast ? "100%" : "0%",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/* ─── Event grouping ─────────────────────────────────────────────────────── */

const proposalEvents = (events: BattleEvent[]) =>
  events.filter((e) => e.round === "proposal_round" && e.eventType === "proposal_created");

const attackEvents = (events: BattleEvent[]) =>
  events.filter((e) => e.round === "cross_attack_round" && e.eventType === "attack_created");

const defenseEvents = (events: BattleEvent[]) =>
  events.filter((e) => e.round === "defense_round" && e.eventType === "defense_created");

/* ─── UI Helpers ─────────────────────────────────────────────────────────── */

const StatusPill = ({
  tone,
  children,
}: {
  tone?: "live" | "done" | "neutral" | "purple";
  children: React.ReactNode;
}) => {
  const toneClass =
    tone === "live"
      ? "bg-status-ok/10 text-status-ok"
      : tone === "done"
        ? "bg-team-infra/10 text-team-infra"
        : tone === "purple"
          ? "bg-team-viral/10 text-team-viral"
          : "bg-bg-sunken text-fg-muted";
  return (
    <span
      className={`inline-flex items-center gap-s-1 rounded-full px-s-3 py-s-1 text-xs font-bold ${toneClass}`}
    >
      {children}
    </span>
  );
};

/* ─── Team mapping ───────────────────────────────────────────────────────── */

const teamColors: Record<string, { text: string; border: string }> = {
  safe_builder: { text: "text-team-safe", border: "border-team-safe" },
  viral_designer: { text: "text-team-viral", border: "border-team-viral" },
  infra_hacker: { text: "text-team-infra", border: "border-team-infra" },
};

const teamNameMap: Record<string, string> = {
  safe_builder: "Safe Builder",
  viral_designer: "Viral Designer",
  infra_hacker: "Infra Hacker",
};

const teamSubtitleMap: Record<string, string> = {
  safe_builder: "Feasibility First",
  viral_designer: "Make It Memorable",
  infra_hacker: "Tech Depth First",
};

const teamAvatarMap: Record<string, string> = {
  safe_builder: "SB",
  viral_designer: "VD",
  infra_hacker: "IH",
};

const uiToEngine: Record<string, string> = {
  "safe-builder": "safe_builder",
  "viral-designer": "viral_designer",
  "infra-hacker": "infra_hacker",
};

const engineToUi: Record<string, string> = {
  safe_builder: "safe-builder",
  viral_designer: "viral-designer",
  infra_hacker: "infra-hacker",
};

const adaptBundleTeam = (raw: {
  id: string;
  name: string;
  score?: number;
}): Team | null => {
  const uiId = engineToUi[raw.id];
  if (!uiId) return null;
  const score = Math.round((raw.score ?? 0) * 1000) / 100;
  return {
    id: uiId as Team["id"],
    name: teamNameMap[raw.id],
    subtitle: teamSubtitleMap[raw.id],
    strategy: raw.name,
    color:
      raw.id === "safe_builder"
        ? "blue"
        : raw.id === "viral_designer"
          ? "purple"
          : "green",
    score,
    avatar: teamAvatarMap[raw.id],
    skills: [],
    spark: [50, 55, 52, 60, 65, 70, 75, 80, 82, Math.min(99, Math.max(40, score))],
  };
};

const colorsFor = (uiId: string) =>
  teamColors[uiToEngine[uiId] ?? "safe_builder"] ?? teamColors.safe_builder;

/* ─── Inline sub-components (avoid arena-cards to keep pg out of client bundle) ─── */

const TeamAvatar = ({ team, size = "md" }: { team: Team; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? 34 : size === "lg" ? 68 : 48;
  const c = colorsFor(team.id);
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-bold ${c.text} bg-bg-elev border ${c.border}`}
      style={{ width: dim, height: dim, fontSize: size === "lg" ? 24 : 14 }}
      aria-hidden="true"
    >
      {team.avatar}
    </span>
  );
};

const TeamScoreCard = ({ team, featured = false }: { team: Team; featured?: boolean }) => {
  const c = colorsFor(team.id);
  return (
    <article
      className={`rounded-r-md border ${c.border} bg-bg-elev p-s-6 shadow-shadow-1 ${featured ? "shadow-shadow-2" : ""}`}
    >
      <div className="flex items-center gap-s-4">
        <TeamAvatar team={team} size="lg" />
        <div>
          <h3 className="m-0 font-bold text-fg">{team.name}</h3>
          <p className="m-0 text-sm text-fg-muted">{team.subtitle}</p>
        </div>
      </div>
      <div className="mt-s-8 flex items-center gap-s-2">
        <strong className="text-3xl font-bold text-fg">{team.score.toFixed(1)}</strong>
        <span className="text-fg-muted">/100</span>
      </div>
    </article>
  );
};

const ProposalCards = ({ proposals, teams }: {
  proposals: BattleEvent[];
  teams: Team[];
}) => {
  if (proposals.length === 0) {
    return <p className="muted">Awaiting proposals...</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-s-4">
      {proposals.map((event) => {
        const uiId = engineToUi[event.actorId ?? ""];
        const team = uiId ? teams.find((t) => t.id === uiId) : undefined;
        if (!team) return null;
        const c = colorsFor(team.id);
        return (
          <article
            key={event.id}
            className={`grid gap-s-3 rounded-r-md border ${c.border} bg-bg-elev p-s-4`}
          >
            <div className="flex items-center gap-s-4">
              <TeamAvatar team={team} size="md" />
              <div>
                <h3 className="m-0 font-bold text-fg">{event.title}</h3>
                <p className="m-0 text-sm text-fg-muted">{team.name}</p>
              </div>
            </div>
            <p className="m-0 text-sm text-fg">{event.content}</p>
          </article>
        );
      })}
    </div>
  );
};

const AttackCards = ({ attacks }: { attacks: BattleEvent[] }) => {
  if (attacks.length === 0) {
    return <p className="muted">Awaiting attacks...</p>;
  }
  return (
    <div className="overflow-hidden rounded-r-md border border-border bg-bg-elev">
      {attacks.map((event) => (
        <article
          key={event.id}
          className="grid grid-cols-[1fr_90px_1.3fr_90px] items-center gap-s-4 border-b border-border p-s-3 last:border-b-0"
        >
          <div className="flex items-center gap-s-2">
            <strong className="text-sm">
              {teamNameMap[event.actorId ?? ""] ?? event.actorId ?? "unknown"}
            </strong>
            <ArrowRight size={16} aria-hidden="true" />
            <strong className="text-sm">
              {teamNameMap[event.targetId ?? ""] ?? event.targetId ?? "unknown"}
            </strong>
          </div>
          <span className="rounded-full bg-sev-high/10 px-s-3 py-s-1 text-xs font-bold text-sev-high">
            Attack
          </span>
          <p className="m-0 text-sm text-fg">{event.content}</p>
          <small className="text-right text-xs text-fg-muted">{event.id}</small>
        </article>
      ))}
    </div>
  );
};

const DefenseCards = ({ defenses }: { defenses: BattleEvent[] }) => {
  if (defenses.length === 0) {
    return <p className="muted">Awaiting defenses...</p>;
  }
  return (
    <div className="grid gap-s-3">
      {defenses.map((event) => (
        <article
          key={event.id}
          className="grid grid-cols-[1fr_auto] items-center gap-s-4 rounded-r-md border border-border bg-bg-elev p-s-4"
        >
          <div className="flex items-center gap-s-2">
            <ShieldCheck size={18} aria-hidden="true" className="text-team-infra" />
            <strong className="text-sm">
              {teamNameMap[event.actorId ?? ""] ?? event.actorId ?? "team"}
            </strong>
            <ArrowRight size={16} aria-hidden="true" />
            <strong className="text-sm">
              {teamNameMap[event.targetId ?? ""] ?? event.targetId ?? "target"}
            </strong>
          </div>
          <span className="rounded-full bg-team-infra/10 px-s-3 py-s-1 text-xs font-bold text-team-infra">
            Defended
          </span>
          <p className="col-span-full m-0 text-sm text-fg">{event.content}</p>
          <small className="col-span-full text-xs text-fg-muted">
            Event ID: {event.id}
          </small>
        </article>
      ))}
    </div>
  );
};

const JudgePanel = () => {
  const judges = ["Judge-Product", "Judge-Tech", "Judge-Market"];
  return (
    <section className="round-section" aria-labelledby="judge-heading">
      <h2 id="judge-heading">Judge Panel (AI)</h2>
      <div className="grid grid-cols-3 gap-s-4">
        {judges.map((judge, index) => (
          <article
            key={judge}
            className="grid grid-cols-[52px_1fr] items-center gap-s-3 rounded-r-md border border-border bg-bg-elev p-s-4"
          >
            <span className="grid h-[52px] w-[52px] place-items-center rounded-full font-bold text-fg bg-bg-sunken">
              J{index + 1}
            </span>
            <div>
              <strong className="text-sm">{judge}</strong>
              <p className="m-0 text-sm text-fg-muted">Analyzing...</p>
              <span className="block h-2 overflow-hidden rounded-full bg-bg-sunken">
                <span
                  className="block h-full rounded-full bg-team-safe"
                  style={{ width: `${58 + index * 12}%` }}
                />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const EventLedger = ({ events }: { events: BattleEvent[] }) => {
  if (events.length === 0) {
    return <p className="muted">No events recorded yet.</p>;
  }
  return (
    <div className="overflow-hidden rounded-r-md border border-border bg-bg-elev">
      {events.map((event) => (
        <article
          key={event.id}
          className="grid grid-cols-[80px_100px_140px_1fr_100px] items-center gap-s-3 border-b border-border p-s-3 last:border-b-0"
        >
          <span className="font-mono text-xs text-fg-muted">
            {new Date(event.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </span>
          <span className="inline-flex items-center justify-center rounded-full bg-team-viral/10 px-s-3 py-s-1 text-xs font-bold text-team-viral">
            {event.eventType}
          </span>
          <strong className="text-sm">{event.actorId ?? event.actorType}</strong>
          <p className="m-0 text-sm text-fg">{event.title}</p>
          <span className="rounded-full bg-bg-sunken px-s-3 py-s-1 text-right text-xs font-bold text-fg-muted">
            {event.round}
          </span>
        </article>
      ))}
    </div>
  );
};

const QuoteBand = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-s-4 rounded-r-md bg-team-viral/5 p-s-4 text-team-viral">
    <Quote size={24} aria-hidden="true" />
    <span>{children}</span>
  </div>
);

/* ─── Page ────────────────────────────────────────────────────────────────── */

type LivePageProps = {
  params: Promise<{ id: string }>;
};

type BundleResponse = {
  battle?: { id?: string; title?: string };
  bundle?: {
    teams?: Array<{ id: string; name: string; score?: number }>;
  };
};

export default function LiveBattlePage({ params }: LivePageProps) {
  const [battleId, setBattleId] = useState<string | null>(null);
  const [battleTitle, setBattleTitle] = useState<string>("Battle");
  const [battleError, setBattleError] = useState<string | null>(null);
  const [battleLoading, setBattleLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [state, dispatch] = useReducer(liveReducer, initialLiveState);
  const handleRef = useRef<SseClientHandle | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((resolved) => {
      if (!cancelled) setBattleId(resolved.id);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!battleId) return;
    let cancelled = false;
    setBattleLoading(true);
    setBattleError(null);

    fetch(`/api/battles/${encodeURIComponent(battleId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Battle not found (${res.status})`);
        return res.json();
      })
      .then((data: BundleResponse) => {
        if (cancelled) return;
        setBattleTitle(data.battle?.title ?? `Battle ${battleId}`);
        const rawTeams = data.bundle?.teams ?? [];
        setTeams(rawTeams.map(adaptBundleTeam).filter((t): t is Team => t !== null));
        setBattleLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setBattleError(err instanceof Error ? err.message : "Failed to load battle");
        setBattleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [battleId]);

  useEffect(() => {
    if (!battleId) return;
    if (handleRef.current) {
      handleRef.current.close();
      handleRef.current = null;
    }

    dispatch({ type: "status", status: "connecting" });

    const handle = connectSse({
      url: `/api/battles/${encodeURIComponent(battleId)}/events/stream`,
      onEvent: (event) => dispatch({ type: "event", event }),
      onValidationError: () => dispatch({ type: "invalid" }),
      onConnectionError: () =>
        dispatch({ type: "status", status: "reconnecting" }),
    });

    handleRef.current = handle;

    const openTimer = setTimeout(() => {
      dispatch({ type: "status", status: "open" });
    }, 100);

    return () => {
      clearTimeout(openTimer);
      handle.close();
      handleRef.current = null;
    };
  }, [battleId]);

  const currentRound = useMemo(() => deriveCurrentRound(state.events), [
    state.events,
  ]);

  const onManualRetry = useCallback(() => {
    dispatch({ type: "reset" });
    if (battleId) {
      dispatch({ type: "status", status: "connecting" });
    }
  }, [battleId]);

  const proposals = proposalEvents(state.events);
  const attacks = attackEvents(state.events);
  const defenses = defenseEvents(state.events);

  const showProposalSection =
    proposals.length > 0 || currentRound === "proposal_round";
  const showAttackSection =
    attacks.length > 0 || currentRound === "cross_attack_round";
  const showDefenseSection =
    defenses.length > 0 || currentRound === "defense_round";

  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <a href="#event-log" className="skip-link">
        Skip to event log
      </a>

      <div className="live-header">
        <div>
          <h1>{battleTitle}</h1>
          <div className="meta-row">
            <span className="battle-id">{battleId ?? "..."}</span>
            <StatusPill
              tone={
                state.status === "open"
                  ? "live"
                  : state.status === "error"
                    ? "done"
                    : "neutral"
              }
            >
              {state.status === "open" ? (
                <Radio size={14} aria-hidden="true" />
              ) : state.status === "error" ? (
                <WifiOff size={14} aria-hidden="true" />
              ) : state.status === "reconnecting" ? (
                <RefreshCw size={14} aria-hidden="true" />
              ) : (
                <Wifi size={14} aria-hidden="true" />
              )}
              {state.status === "open" ? "LIVE" : state.status.toUpperCase()}
            </StatusPill>
            {state.invalidCount > 0 ? (
              <StatusPill tone="done">
                <CircleAlert size={14} aria-hidden="true" />
                {state.invalidCount} dropped
              </StatusPill>
            ) : null}
          </div>
        </div>
        <span className="timer" aria-live="polite">
          <Clock3 size={20} aria-hidden="true" />
          {state.events.length} events
        </span>
      </div>

      {battleError ? (
        <div role="alert" className="error-banner">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{battleError}</span>
          <button type="button" onClick={onManualRetry} className="retry-btn">
            <RefreshCw size={14} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}

      <RoundTimeline currentRound={currentRound} />

      <section className="team-score-grid" aria-label="Contestant teams">
        {teams.slice(0, 3).map((team) => (
          <TeamScoreCard
            key={team.id}
            team={team}
            featured={team.id === "viral-designer"}
          />
        ))}
      </section>

      {battleLoading && state.events.length === 0 ? (
        <section className="loading-state" role="status" aria-live="polite">
          <Loader2 size={32} className="spin" aria-hidden="true" />
          <p>Waiting for first event from the battle engine...</p>
        </section>
      ) : null}

      {!battleLoading && !battleError && state.events.length === 0 ? (
        <section className="empty-state" role="status">
          <ShieldCheck size={32} aria-hidden="true" />
          <h2>No events yet</h2>
          <p>The battle engine is warming up. Events will stream in as they happen.</p>
        </section>
      ) : null}

      {showProposalSection ? (
        <section className="round-section" aria-labelledby="proposals-heading">
          <h2 id="proposals-heading">
            <span className="section-icon">
              <Trophy size={18} aria-hidden="true" />
            </span>
            Round: Proposal
            <span className="event-count">{proposals.length}</span>
          </h2>
          <p>Each Agent Team generates a distinct plan before the fight starts.</p>
          <ProposalCards proposals={proposals} teams={teams} />
        </section>
      ) : null}

      {showAttackSection ? (
        <section className="round-section" aria-labelledby="attacks-heading">
          <h2 id="attacks-heading">
            <span className="section-icon">
              <Swords size={18} aria-hidden="true" />
            </span>
            Round: Cross Attack
            <span className="event-count">{attacks.length}</span>
          </h2>
          <p>Teams attack each other&apos;s proposals.</p>
          <AttackCards attacks={attacks} />
        </section>
      ) : null}

      {showDefenseSection ? (
        <section className="round-section" aria-labelledby="defense-heading">
          <h2 id="defense-heading">
            <span className="section-icon">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            Round: Defense & Rebuttal
            <span className="event-count">{defenses.length}</span>
          </h2>
          <p>Teams accept or reject critiques and revise their plans.</p>
          <DefenseCards defenses={defenses} />
        </section>
      ) : null}

      <JudgePanel />

      <section
        id="event-log"
        className="round-section"
        aria-labelledby="event-log-heading"
      >
        <h2 id="event-log-heading">Event Ledger</h2>
        <p>Live event stream from the battle engine.</p>
        <EventLedger events={state.events} />
      </section>

      <div className="next-band">
        <QuoteBand>Next: teams move into Defense to respond and revise.</QuoteBand>
        <Link href={"/battle/demo/replay" as Route} className="primary-action">
          <Play size={18} fill="currentColor" aria-hidden="true" />
          View Replay
        </Link>
      </div>
    </AppShell>
  );
}