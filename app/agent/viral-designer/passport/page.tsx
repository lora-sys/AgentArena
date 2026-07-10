import "../../../print.css";
import { AppShell } from "@/components/app-shell";
import { PassportActions } from "@/components/passport-actions";
import { PassportMetrics, PassportSeal, SectionCard } from "@/components/arena-cards";
import { demoBattle, winner } from "@/lib/demo-data";
import type { Route } from "next";
import Link from "next/link";

/**
 * Static passport snapshot for viral-designer (the champion).
 *
 * Mirrors the layout of app/agent/[id]/passport/page.tsx — gold seal,
 * identity strip, two-column strengths/weaknesses, evidence links,
 * and replay/print/share actions — per docs/design.md §4.6 / §5.6.
 *
 * This static route is what the build pre-renders for the demo.
 * Next.js matches static segments before dynamic ones, so both
 * pages must stay in sync.
 */
export default function ViralDesignerPassportPage() {
  const team = winner;
  const battle = demoBattle;
  const passport = demoBattle.passport;
  const shareUrl = `https://agentarena.ai/agent/viral-designer/passport`;

  const sealInitials = team.name
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AG";

  const strengthsList = passport.strengths.length > 0
    ? passport.strengths
    : ["No clear strengths surfaced from the battle."];
  const weaknessesList = passport.areasToImprove.length > 0
    ? passport.areasToImprove
    : ["Low-severity weaknesses detected — no critical gaps found."];

  return (
    <AppShell active="passport" showRail currentRound="passport">
      <div className="passport-layout print-target">

        {/* IDENTITY STRIP — gold seal + name + role + version */}
        <section
          className="passport-hero"
          style={{ gridColumn: "1 / -1" }}
          aria-label="Agent identity"
        >
          <PassportSeal
            initials={sealInitials}
            size={80}
            ariaLabel="Champion seal"
          />
          <div className="passport-identity">
            <h1>{team.name}</h1>
            <p className="passport-role">{team.subtitle}</p>
            <div className="passport-pill-row">
              <span className="path-pill passport-version">v1</span>
              <span className="path-pill">agents/viral-designer</span>
              <span className="status-pill champion">Champion</span>
            </div>
          </div>
        </section>

        {/* LEFT COLUMN — contribution + evidence */}
        <div className="passport-left">
          <SectionCard title="Contribution Summary">
            <p style={{ margin: 0, color: "var(--fg-muted)", lineHeight: 1.55 }}>
              {team.name} contributed {passport.acceptedClaims.length} accepted claims and {passport.rejectedClaims.length} rejected claims across {battle.events.length} events.
            </p>
            <div className="metric-grid compact" style={{ marginTop: 16 }}>
              <article className="metric-card">
                <span>Battle</span>
                <strong>{battle.id}</strong>
              </article>
              <article className="metric-card">
                <span>Score</span>
                <strong>{passport.contributionScore.toLocaleString()}</strong>
              </article>
              <article className="metric-card">
                <span>Accepted</span>
                <strong>{passport.acceptedClaims.length}</strong>
              </article>
              <article className="metric-card">
                <span>Rejected</span>
                <strong>{passport.rejectedClaims.length}</strong>
              </article>
            </div>
          </SectionCard>

          <SectionCard title="Reputation Snapshot">
            <PassportMetrics />
          </SectionCard>

          <SectionCard title="Evidence Chain">
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "var(--t-sm)",
                color: "var(--fg-muted)",
              }}
            >
              Each claim below is backed by an event from the battle replay. Click any link to view the source event.
            </p>
            <div className="evidence-list">
              {passport.acceptedClaims.map((claim) => (
                <article key={`acc-${claim.attackId}`} className="evidence-row">
                  <span className="evidence-type accepted">Accepted</span>
                  <p>{claim.claim}</p>
                  <Link
                    href={`/battle/${battle.id}/replay?event=${claim.attackId}` as Route}
                    className="evidence-link font-mono"
                  >
                    {claim.attackId}
                  </Link>
                </article>
              ))}
              {passport.rejectedClaims.map((claim) => (
                <article key={`rej-${claim.attackId}`} className="evidence-row">
                  <span className="evidence-type rejected">Rejected</span>
                  <p>{claim.claim}</p>
                  <Link
                    href={`/battle/${battle.id}/replay?event=${claim.attackId}` as Route}
                    className="evidence-link font-mono"
                  >
                    {claim.attackId}
                  </Link>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN — strengths | weaknesses + actions */}
        <div className="passport-right">
          <div
            className="passport-two-col"
            data-testid="strengths-weaknesses"
          >
            <div>
              <h2 className="passport-two-col-heading">Strengths</h2>
              <div className="pill-row" data-testid="strengths-column">
                {strengthsList.map((strength) => (
                  <span key={strength} className="soft-pill purple">
                    {strength}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="passport-two-col-heading">Weaknesses</h2>
              <div className="pill-row" data-testid="weaknesses-column">
                {weaknessesList.map((weakness) => (
                  <span key={weakness} className="soft-pill red">
                    {weakness}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <SectionCard title="Actions">
            <PassportActions battleId={battle.id} shareUrl={shareUrl} />
            <div className="share-url no-print" aria-label="Shareable URL">
              <code>{shareUrl}</code>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}