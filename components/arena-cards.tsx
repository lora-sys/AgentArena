"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Download,
  Play,
  Quote,
  Swords,
  Trophy
} from "lucide-react";
import {
  defenses,
  demoBattle,
  formatScore,
  getTeam,
  proposals,
  teams,
  winner
} from "@/lib/demo-data";
import type {
  Attack,
  BattleEvent,
  ScoreBreakdown,
  Team,
  TeamId
} from "@/lib/types";

/* Team color → token mapping for design system direction B */
const teamColorMap: Record<Team["color"], string> = {
  blue: "text-team-safe",
  purple: "text-team-viral",
  green: "text-team-infra",
  orange: "text-champion"
};

const teamBorderMap: Record<Team["color"], string> = {
  blue: "border-team-safe",
  purple: "border-team-viral",
  green: "border-team-infra",
  orange: "border-champion"
};

const severityTokenMap: Record<string, string> = {
  High: "bg-sev-high/10 text-sev-high",
  Medium: "bg-sev-med/10 text-sev-med",
  Low: "bg-sev-low/10 text-sev-low"
};

export function TeamAvatar({ team, size = "md" }: { team: Team; size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-bold ${teamColorMap[team.color]} bg-bg-elev border ${teamBorderMap[team.color]}`}
      style={{ width: size === "sm" ? 34 : size === "lg" ? 68 : 48, height: size === "sm" ? 34 : size === "lg" ? 68 : 48 }}
      aria-hidden="true"
    >
      {team.avatar}
    </span>
  );
}

export function Sparkline({ values, color }: { values: number[]; color: Team["color"] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 90 - ((value - min) / Math.max(max - min, 1)) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className={`sparkline ${color}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points={points} />
    </svg>
  );
}

export function TeamScoreCard({ team, featured = false }: { team: Team; featured?: boolean }) {
  return (
    <article
      className={`rounded-r-md border ${teamBorderMap[team.color]} bg-bg-elev p-s-6 shadow-shadow-1 ${featured ? "shadow-shadow-2" : ""}`}
    >
      <div className="flex items-center gap-s-4">
        <TeamAvatar team={team} size="lg" />
        <div>
          <h3 className="m-0 font-bold text-fg">{team.name}</h3>
          <p className="m-0 text-sm text-fg-muted">{team.subtitle}</p>
        </div>
      </div>
      <div className="mt-s-8 flex items-center gap-s-2">
        <strong className="text-3xl font-bold text-fg">{formatScore(team.score)}</strong>
        <span className="text-fg-muted">/100</span>
        <Sparkline values={team.spark} color={team.color} />
      </div>
    </article>
  );
}

export function TeamProfileCard({ team }: { team: Team }) {
  return (
    <article className={`rounded-r-md border ${teamBorderMap[team.color]} bg-bg-elev p-s-6 shadow-shadow-1`}>
      <TeamAvatar team={team} size="lg" />
      <div>
        <h3 className="m-0 font-bold text-fg">{team.name}</h3>
        <p className="text-sm text-fg-muted">{team.subtitle}</p>
        <p className="mt-s-2 text-fg">{team.strategy}</p>
      </div>
      <div className="flex flex-wrap gap-s-2">
        {team.skills.map((skill) => (
          <span
            key={skill}
            className={`rounded-full px-s-3 py-s-1 text-xs font-bold ${teamColorMap[team.color]} bg-bg-sunken`}
          >
            {skill}
          </span>
        ))}
      </div>
      <Link
        href={`/agent/${team.id}/passport` as Route}
        className="inline-flex items-center gap-s-2 font-bold text-team-safe"
      >
        View Details <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className = ""
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-r-md border border-border bg-bg-elev p-s-6 shadow-shadow-1 ${className}`}>
      {title || action ? (
        <div className="mb-s-4 flex items-center justify-between gap-s-4">
          {title ? <h2 className="m-0 font-bold text-fg">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatusPill({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "live" | "done" | "neutral" | "purple";
}) {
  const toneClass =
    tone === "live"
      ? "bg-status-ok/10 text-status-ok"
      : tone === "done"
        ? "bg-team-infra/10 text-team-infra"
        : tone === "purple"
          ? "bg-team-viral/10 text-team-viral"
          : "bg-bg-sunken text-fg-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-s-3 py-s-1 text-xs font-bold ${toneClass}`}>
      {label}
    </span>
  );
}

export function AttackList({ attacks = demoBattle.attacks }: { attacks?: Attack[] }) {
  return (
    <div className="overflow-hidden rounded-r-md border border-border bg-bg-elev">
      {attacks.map((attack) => {
        const from = getTeam(attack.from);
        const to = getTeam(attack.to);
        if (!from || !to) return null;

        return (
          <article
            key={`${attack.from}-${attack.to}-${attack.claim}`}
            className="grid grid-cols-[1fr_90px_1.3fr_90px] items-center gap-s-4 border-b border-border p-s-3 last:border-b-0"
          >
            <div className="flex items-center gap-s-2">
              <TeamAvatar team={from} size="sm" />
              <strong className="text-sm">{from.name}</strong>
              <ArrowRight size={16} />
              <TeamAvatar team={to} size="sm" />
              <strong className="text-sm">{to.name}</strong>
            </div>
            <span className={`rounded-full px-s-3 py-s-1 text-xs font-bold ${severityTokenMap[attack.severity] ?? severityTokenMap.Low}`}>
              {attack.severity}
            </span>
            <p className="m-0 text-sm text-fg">{attack.claim}</p>
            <small className="text-right text-xs text-fg-muted">{attack.createdAt}</small>
          </article>
        );
      })}
    </div>
  );
}

export function ProposalComparison() {
  return (
    <div className="grid grid-cols-3 gap-s-4">
      {proposals.map((proposal) => {
        const team = getTeam(proposal.teamId);
        if (!team) return null;

        return (
          <article
            key={proposal.teamId}
            className={`grid gap-s-3 rounded-r-md border ${teamBorderMap[team.color]} bg-bg-elev p-s-4`}
          >
            <div className="flex items-center gap-s-4">
              <TeamAvatar team={team} size="md" />
              <div>
                <h3 className="m-0 font-bold text-fg">{proposal.productName}</h3>
                <p className="m-0 text-sm text-fg-muted">{team.name}</p>
              </div>
            </div>
            <p className="m-0 text-sm text-fg">{proposal.oneLiner}</p>
            <dl className="m-0 grid gap-s-2">
              <div>
                <dt className="text-xs font-bold uppercase text-fg-muted">Demo Plan</dt>
                <dd className="mt-s-1 text-sm text-fg">{proposal.demoPlan}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-fg-muted">Technical Hook</dt>
                <dd className="mt-s-1 text-sm text-fg">{proposal.technicalHighlight}</dd>
              </div>
            </dl>
            <span className={`w-fit rounded-full px-s-3 py-s-1 text-xs font-bold ${teamColorMap[team.color]} bg-bg-sunken`}>
              {proposal.whyThisCanWin}
            </span>
          </article>
        );
      })}
    </div>
  );
}

export function DefenseList() {
  return (
    <div className="grid gap-s-3">
      {defenses.map((defense) => {
        const team = getTeam(defense.teamId);
        const attacker = getTeam(defense.targetTeamId);
        if (!team || !attacker) return null;

        return (
          <article
            key={defense.id}
            className="grid grid-cols-[1fr_auto] items-center gap-s-4 rounded-r-md border border-border bg-bg-elev p-s-4"
          >
            <div className="flex items-center gap-s-2">
              <TeamAvatar team={team} size="sm" />
              <strong className="text-sm">{team.name}</strong>
              <ArrowRight size={16} />
              <TeamAvatar team={attacker} size="sm" />
              <strong className="text-sm">{attacker.name}</strong>
            </div>
            <span
              className={`rounded-full px-s-3 py-s-1 text-xs font-bold ${defense.acceptedAttack ? "bg-sev-high/10 text-sev-high" : "bg-team-infra/10 text-team-infra"}`}
            >
              {defense.acceptedAttack ? "Accepted critique" : "Rejected critique"}
            </span>
            <p className="col-span-full m-0 text-sm text-fg">{defense.revision}</p>
            <small className="col-span-full text-xs text-fg-muted">
              Evidence: {defense.attackId} / {defense.id}
            </small>
          </article>
        );
      })}
    </div>
  );
}

export function JudgeProgress() {
  return (
    <SectionCard
      title="Judge Panel (AI)"
      action={<Link href="/battle/demo/result">View all judges</Link>}
    >
      <div className="grid grid-cols-3 gap-s-4">
        {["Judge-Product", "Judge-Tech", "Judge-Market"].map((judge, index) => (
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
    </SectionCard>
  );
}

export function Scoreboard({ compact = false }: { compact?: boolean }) {
  const ordered = [...teams].sort((a, b) => b.score - a.score);
  const columns: Array<[keyof ScoreBreakdown, string]> = [
    ["novelty", "Novelty"],
    ["feasibility", "Feasibility"],
    ["demoWow", "Demo Wow"],
    ["technicalDepth", "Tech Depth"],
    ["userValue", "User Value"],
    ["longTermPotential", "Long-term"]
  ];

  return (
    <div className={`overflow-x-auto ${compact ? "compact" : ""}`}>
      <div className="grid min-w-[980px] grid-cols-[60px_1fr_120px_repeat(6,1fr)] items-center gap-s-3 p-s-3 text-sm font-bold text-fg-muted">
        <span>Rank</span>
        <span>Team</span>
        <span>Total Score</span>
        {!compact ? columns.map(([, label]) => <span key={label}>{label}</span>) : null}
      </div>
      {ordered.map((team, index) => (
        <div
          key={team.id}
          className={`grid min-w-[980px] grid-cols-[60px_1fr_120px_repeat(6,1fr)] items-center gap-s-3 border-t border-border p-s-3 ${team.id === demoBattle.winnerId ? "bg-team-viral/5" : ""}`}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-bg-sunken text-xs font-bold text-fg">
            {index + 1}
          </span>
          <span className="flex items-center gap-s-2">
            <TeamAvatar team={team} size="sm" />
            <strong>{team.name}</strong>
          </span>
          <span className={`text-xl font-bold ${teamColorMap[team.color]}`}>
            {formatScore(team.score)}
          </span>
          {!compact
            ? columns.map(([key]) => (
                <span key={key} className="grid gap-s-1">
                  {demoBattle.scores[team.id][key]}
                  <i
                    className={`block h-1 rounded-full ${teamColorMap[team.color].replace("text-", "bg-")}`}
                    style={{ width: `${demoBattle.scores[team.id][key]}%` }}
                  />
                </span>
              ))
            : null}
        </div>
      ))}
    </div>
  );
}

export function EventLog({ events = demoBattle.events }: { events?: BattleEvent[] }) {
  return (
    <div className="overflow-hidden rounded-r-md border border-border bg-bg-elev">
      {events.map((event) => (
        <article
          key={event.id}
          className="grid grid-cols-[80px_86px_140px_1fr_80px] items-center gap-s-3 border-b border-border p-s-3 last:border-b-0"
        >
          <span className="font-mono text-xs text-fg-muted">{event.time}</span>
          <span className="inline-flex items-center justify-center rounded-full bg-team-viral/10 px-s-3 py-s-1 text-xs font-bold text-team-viral">
            {event.type}
          </span>
          <strong className="text-sm">{event.actor}</strong>
          <p className="m-0 text-sm text-fg">{event.summary}</p>
          {event.impact ? (
            <span
              className={`rounded-full px-s-3 py-s-1 text-xs font-bold ${severityTokenMap[event.impact] ?? ""}`}
            >
              {event.impact}
            </span>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ChampionHero() {
  if (!winner) return null;
  return (
    <section className="grid grid-cols-[240px_1fr_1fr] items-center gap-s-12 rounded-r-md border border-champion bg-bg-elev p-s-12 shadow-shadow-2">
      <div className="grid place-items-center text-champion">
        <Trophy size={92} />
      </div>
      <div>
        <p className="flex items-center gap-s-2 font-bold text-team-viral">
          <Trophy size={18} /> Champion Plan
        </p>
        <h1 className="m-0 text-t-2xl font-bold text-fg">{winner.name}</h1>
        <p className="mt-s-2 flex items-center gap-s-2 text-fg-muted">
          <strong className="text-2xl text-fg">{formatScore(winner.score)}</strong> /100
          <StatusPill label="Winner" tone="purple" />
        </p>
      </div>
      <div className="border-l border-border pl-s-12">
        <h2 className="m-0 font-bold text-fg">Why it won</h2>
        <p className="mt-s-2 text-fg-muted">
          Viral Designer delivered the most compelling, differentiated, and technically credible plan with a strong
          demo story and a clear long-term reputation path.
        </p>
        <div className="mt-s-4 flex items-center gap-s-3">
          <Link
            href="/battle/demo/replay"
            className="inline-flex items-center gap-s-2 rounded-r-md bg-team-safe px-s-6 py-s-2 font-bold text-white"
          >
            <Play size={16} fill="currentColor" />
            View Replay
          </Link>
          <a
            href="/api/battles/demo/export"
            className="inline-flex items-center gap-s-2 rounded-r-md border border-border px-s-6 py-s-2 font-bold text-fg bg-bg-elev"
          >
            <Download size={16} />
            Export Markdown
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * PassportSeal — gold seal per design.md §4.6 / §2.1.
 * Circular, champion-gold ring, team initials centered.
 *
 * The seal is the only place champion gold appears in the passport
 * (besides the winner pill and the exported report cover). It must
 * NOT be used on buttons or in body copy.
 */
export function PassportSeal({
  initials,
  size = 80,
  ariaLabel = "Champion seal",
}: {
  initials: string;
  size?: number;
  ariaLabel?: string;
}) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const innerRadius = radius - 6;
  return (
    <div className="passport-seal-wrap" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle
          className="passport-seal-ring"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="passport-seal-fill"
          cx={center}
          cy={center}
          r={innerRadius}
        />
        <text
          className="passport-seal-initials"
          x={center}
          y={center + size * 0.08}
          textAnchor="middle"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}

export function PassportMetrics() {
  const passport = demoBattle.passport;
  return (
    <div className="grid grid-cols-2 gap-s-6">
      {[
        ["Rating", `${passport.rating}/100`],
        ["Global Rank", `#${passport.globalRank}`],
        ["Win Rate", `${passport.winRate}%`],
        ["Top-3 Rate", `${passport.topThreeRate}%`],
        ["Contribution", passport.contributionScore.toLocaleString()],
        ["Consistency", `${passport.consistency}/10`]
      ].map(([label, value]) => (
        <article
          key={label}
          className="min-h-[96px] rounded-r-md border border-border bg-bg-elev p-s-4"
        >
          <span className="block text-sm text-fg-muted">{label}</span>
          <strong className="block text-2xl font-bold text-fg">{value}</strong>
        </article>
      ))}
    </div>
  );
}

export function ClaimList({ type }: { type: "accepted" | "rejected" }) {
  const claims = type === "accepted" ? demoBattle.passport.acceptedClaims : demoBattle.passport.rejectedClaims;
  const Icon = type === "accepted" ? CheckCircle2 : CircleAlert;

  return (
    <div className="grid gap-s-2">
      {claims.map((claim) => (
        <article
          key={`${claim.attackId}-${claim.defenseId}`}
          className="grid grid-cols-[24px_1fr_auto] items-center gap-s-2 border-b border-border py-s-2 last:border-b-0"
        >
          <Icon size={18} />
          <p className="m-0">
            {claim.claim}
            <small className="mt-s-1 block text-xs text-fg-muted">
              Evidence: {claim.attackId} / {claim.defenseId}
            </small>
          </p>
          <span
            className={`rounded-full px-s-3 py-s-1 text-xs font-bold ${type === "accepted" ? "bg-team-infra/10 text-team-infra" : "bg-sev-high/10 text-sev-high"}`}
          >
            {type === "accepted" ? "Accepted" : "Rejected"}
          </span>
        </article>
      ))}
    </div>
  );
}

export function ReplayShareCard() {
  return (
    <SectionCard className="share-card">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-s-3">
        {teams[0] && <TeamAvatar team={teams[0]} size="lg" />}
        <span className="font-bold text-fg-muted">VS</span>
        {teams[1] && <TeamAvatar team={teams[1]} size="lg" />}
      </div>
      <div>
        <h2 className="m-0 font-bold text-fg">Share this battle</h2>
        <p className="mt-s-2 text-fg-muted">Anyone with the link can watch this replay.</p>
        <div className="mt-s-3 overflow-hidden truncate whitespace-nowrap rounded-r-md border border-border p-s-3 text-fg-muted">
          https://agentarena.ai/battles/agent-metaverse-hackathon/replay
        </div>
      </div>
    </SectionCard>
  );
}

export function QuoteBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-s-4 rounded-r-md bg-team-viral/5 p-s-4 text-team-viral">
      <Quote size={24} />
      <span>{children}</span>
    </div>
  );
}

export function MiniStat({
  icon,
  label,
  value,
  note
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="flex min-h-[104px] items-center gap-s-4 rounded-r-md border border-border bg-bg-elev p-s-4 shadow-shadow-1">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-team-safe/10 text-team-safe">
        {icon}
      </span>
      <div>
        <p className="m-0 text-sm text-fg-muted">{label}</p>
        <strong className="my-s-1 block text-2xl font-bold text-fg">{value}</strong>
        <small className="text-fg-muted">{note}</small>
      </div>
    </article>
  );
}

export function FlowStrip() {
  const steps = ["Briefing", "Proposal", "Cross Attack", "Judging", "Champion"];
  return (
    <section className="grid grid-cols-[170px_repeat(5,1fr)] items-center gap-s-4 rounded-r-md border border-border bg-bg-elev p-s-6">
      <strong className="font-bold text-fg">How it works</strong>
      {steps.map((step, index) => (
        <div key={step} className={`flex items-center gap-s-3 ${index === 2 ? "text-team-safe" : "text-fg"}`}>
          <span
            className={`grid h-[42px] w-[42px] place-items-center rounded-full bg-bg-sunken text-white ${index === 2 ? "bg-team-safe" : ""}`}
          >
            {index === 2 ? <Swords size={18} /> : <FlagIcon />}
          </span>
          <p className="m-0 font-bold">{step}</p>
        </div>
      ))}
    </section>
  );
}

function FlagIcon() {
  return <BadgeCheck size={18} />;
}
