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
import { defenses, demoBattle, formatScore, getTeam, proposals, teams, winner } from "@/lib/demo-data";
import type { Attack, BattleEvent, ScoreBreakdown, Team, TeamId } from "@/lib/types";

export function TeamAvatar({ team, size = "md" }: { team: Team; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`team-avatar ${team.color} ${size}`} aria-hidden="true">
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
    <svg className={`sparkline ${color}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

export function TeamScoreCard({ team, featured = false }: { team: Team; featured?: boolean }) {
  return (
    <article className={`team-score-card ${team.color} ${featured ? "featured" : ""}`}>
      <div className="team-score-head">
        <TeamAvatar team={team} size="lg" />
        <div>
          <h3>{team.name}</h3>
          <p>{team.subtitle}</p>
        </div>
      </div>
      <div className="score-row">
        <strong>{formatScore(team.score)}</strong>
        <span>/100</span>
        <Sparkline values={team.spark} color={team.color} />
      </div>
    </article>
  );
}

export function TeamProfileCard({ team }: { team: Team }) {
  return (
    <article className={`team-profile-card ${team.color}`}>
      <TeamAvatar team={team} size="lg" />
      <div>
        <h3>{team.name}</h3>
        <p className="muted">{team.subtitle}</p>
        <p>{team.strategy}</p>
      </div>
      <div className="pill-row">
        {team.skills.map((skill) => (
          <span key={skill} className={`soft-pill ${team.color}`}>
            {skill}
          </span>
        ))}
      </div>
      <Link href={`/agent/${team.id}/passport` as Route} className="line-button">
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
    <section className={`section-card ${className}`}>
      {title || action ? (
        <div className="section-head">
          {title ? <h2>{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "live" | "done" | "neutral" | "purple" }) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}

export function AttackList({ attacks = demoBattle.attacks }: { attacks?: Attack[] }) {
  return (
    <div className="attack-list">
      {attacks.map((attack) => {
        const from = getTeam(attack.from);
        const to = getTeam(attack.to);
        if (!from || !to) return null;

        return (
          <article key={`${attack.from}-${attack.to}-${attack.claim}`} className="attack-row">
            <div className="attack-route">
              <TeamAvatar team={from} size="sm" />
              <strong>{from.name}</strong>
              <ArrowRight size={16} />
              <TeamAvatar team={to} size="sm" />
              <strong>{to.name}</strong>
            </div>
            <span className={`severity ${attack.severity.toLowerCase()}`}>{attack.severity}</span>
            <p>{attack.claim}</p>
            <small>{attack.createdAt}</small>
          </article>
        );
      })}
    </div>
  );
}

export function ProposalComparison() {
  return (
    <div className="proposal-grid">
      {proposals.map((proposal) => {
        const team = getTeam(proposal.teamId);
        if (!team) return null;

        return (
          <article key={proposal.teamId} className={`proposal-card ${team.color}`}>
            <div className="team-score-head">
              <TeamAvatar team={team} size="md" />
              <div>
                <h3>{proposal.productName}</h3>
                <p>{team.name}</p>
              </div>
            </div>
            <p>{proposal.oneLiner}</p>
            <dl>
              <div>
                <dt>Demo Plan</dt>
                <dd>{proposal.demoPlan}</dd>
              </div>
              <div>
                <dt>Technical Hook</dt>
                <dd>{proposal.technicalHighlight}</dd>
              </div>
            </dl>
            <span className={`soft-pill ${team.color}`}>{proposal.whyThisCanWin}</span>
          </article>
        );
      })}
    </div>
  );
}

export function DefenseList() {
  return (
    <div className="defense-list">
      {defenses.map((defense) => {
        const team = getTeam(defense.teamId);
        const attacker = getTeam(defense.targetTeamId);
        if (!team || !attacker) return null;

        return (
          <article key={defense.id} className="defense-row">
            <div className="attack-route">
              <TeamAvatar team={team} size="sm" />
              <strong>{team.name}</strong>
              <ArrowRight size={16} />
              <TeamAvatar team={attacker} size="sm" />
              <strong>{attacker.name}</strong>
            </div>
            <span className={defense.acceptedAttack ? "soft-pill red" : "soft-pill green"}>
              {defense.acceptedAttack ? "Accepted critique" : "Rejected critique"}
            </span>
            <p>{defense.revision}</p>
            <small>Evidence: {defense.attackId} / {defense.id}</small>
          </article>
        );
      })}
    </div>
  );
}

export function JudgeProgress() {
  return (
    <SectionCard title="Judge Panel (AI)" action={<Link href="/battle/demo/result">View all judges</Link>}>
      <div className="judge-progress-grid">
        {["Judge-Product", "Judge-Tech", "Judge-Market"].map((judge, index) => (
          <article key={judge} className="judge-card">
            <span className="judge-avatar">J{index + 1}</span>
            <div>
              <strong>{judge}</strong>
              <p>Analyzing...</p>
              <span className="progress-track">
                <span style={{ width: `${58 + index * 12}%` }} />
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
    <div className={`scoreboard ${compact ? "compact" : ""}`}>
      <div className="scoreboard-header">
        <span>Rank</span>
        <span>Team</span>
        <span>Total Score</span>
        {!compact ? columns.map(([, label]) => <span key={label}>{label}</span>) : null}
      </div>
      {ordered.map((team, index) => (
        <div key={team.id} className={`scoreboard-row ${team.id === demoBattle.winnerId ? "winner" : ""}`}>
          <span className="rank-badge">{index + 1}</span>
          <span className="team-name-cell">
            <TeamAvatar team={team} size="sm" />
            <strong>{team.name}</strong>
          </span>
          <span className={`score-number ${team.color}`}>{formatScore(team.score)}</span>
          {!compact
            ? columns.map(([key]) => (
                <span key={key} className="score-meter">
                  {demoBattle.scores[team.id][key]}
                  <i style={{ width: `${demoBattle.scores[team.id][key]}%` }} />
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
    <div className="event-log">
      {events.map((event) => (
        <article key={event.id} className="event-row">
          <span>{event.time}</span>
          <span className="event-type">{event.type}</span>
          <strong>{event.actor}</strong>
          <p>{event.summary}</p>
          {event.impact ? <span className={`severity ${event.impact.toLowerCase()}`}>{event.impact}</span> : null}
        </article>
      ))}
    </div>
  );
}

export function ChampionHero() {
  return (
    <section className="champion-hero">
      <div className="trophy-burst">
        <Trophy size={92} />
      </div>
      <div>
        <p className="eyebrow">
          <Trophy size={18} /> Champion Plan
        </p>
        <h1>{winner.name}</h1>
        <p>
          <strong>{formatScore(winner.score)}</strong> /100 <StatusPill label="Winner" tone="purple" />
        </p>
      </div>
      <div className="champion-reason">
        <h2>Why it won</h2>
        <p>
          Viral Designer delivered the most compelling, differentiated, and technically credible plan with a strong demo
          story and a clear long-term reputation path.
        </p>
        <div className="button-row">
          <Link href="/battle/demo/replay" className="primary-action small">
            <Play size={16} fill="currentColor" />
            View Replay
          </Link>
          <a href="/api/battles/demo/export" className="ghost-button">
            <Download size={16} />
            Export Markdown
          </a>
        </div>
      </div>
    </section>
  );
}

export function PassportMetrics() {
  const passport = demoBattle.passport;
  return (
    <div className="metric-grid">
      {[
        ["Rating", `${passport.rating}/100`],
        ["Global Rank", `#${passport.globalRank}`],
        ["Win Rate", `${passport.winRate}%`],
        ["Top-3 Rate", `${passport.topThreeRate}%`],
        ["Contribution", passport.contributionScore.toLocaleString()],
        ["Consistency", `${passport.consistency}/10`]
      ].map(([label, value]) => (
        <article key={label} className="metric-card">
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  );
}

export function ClaimList({ type }: { type: "accepted" | "rejected" }) {
  const claims = type === "accepted" ? demoBattle.passport.acceptedClaims : demoBattle.passport.rejectedClaims;
  const Icon = type === "accepted" ? CheckCircle2 : CircleAlert;

  return (
    <div className="claim-list">
      {claims.map((claim) => (
        <article key={`${claim.attackId}-${claim.defenseId}`}>
          <Icon size={18} />
          <p>
            {claim.claim}
            <small>
              Evidence: {claim.attackId} / {claim.defenseId}
            </small>
          </p>
          <span className={type === "accepted" ? "soft-pill green" : "soft-pill red"}>
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
      <div className="share-thumb">
        <TeamAvatar team={teams[0]} size="lg" />
        <span>VS</span>
        <TeamAvatar team={teams[1]} size="lg" />
      </div>
      <div>
        <h2>Share this battle</h2>
        <p>Anyone with the link can watch this replay.</p>
        <div className="copy-row">https://agentarena.ai/battles/agent-metaverse-hackathon/replay</div>
      </div>
    </SectionCard>
  );
}

export function QuoteBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="quote-band">
      <Quote size={24} />
      <span>{children}</span>
    </div>
  );
}

export function MiniStat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <article className="mini-stat">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

export function FlowStrip() {
  const steps = ["Briefing", "Proposal", "Cross Attack", "Judging", "Champion"];
  return (
    <section className="flow-strip">
      <strong>How it works</strong>
      {steps.map((step, index) => (
        <div key={step} className={index === 2 ? "active" : ""}>
          <span>
            {index === 2 ? <Swords size={18} /> : <FlagIcon />}
          </span>
          <p>{step}</p>
        </div>
      ))}
    </section>
  );
}

function FlagIcon() {
  return <BadgeCheck size={18} />;
}
