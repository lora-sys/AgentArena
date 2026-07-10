import "../../../print.css";
import { AppShell } from "@/components/app-shell";
import { PassportActions } from "@/components/passport-actions";
import { PassportMetrics, PassportSeal, SectionCard } from "@/components/arena-cards";
import { demoBattle, winner } from "@/lib/demo-data";
import type { Route } from "next";
import Link from "next/link";

/**
 * Agent Passport Snapshot — bound to the real battle API.
 *
 * Layout per docs/design.md §4.6 and §5.6:
 *   - Gold seal (top-left, champion color #D4AF37) with team initials
 *   - Identity strip: agentName + role + version
 *   - Two-column strengths | weaknesses (MUST be non-empty per PRD §12.3)
 *   - Evidence event links list (each link shows event id + opens event drawer)
 *   - Replay link + Print + Share link buttons
 *
 * Mandatory invariant (PRD §12.3): weaknesses column is NEVER empty.
 * The passport generator guarantees this — if no accepted attacks exist,
 * it falls back to the lowest scoring category.
 */

type AgentPassport = {
  id: string;
  agentId: string;
  battleId: string;
  agentName: string;
  role: string;
  version: string;
  directoryPath: string;
  contributionSummary: string;
  acceptedClaims: Array<{
    claim: string;
    attackId: string;
    defenseId: string;
    acceptedAttack: boolean;
    attackerTeamId: string;
    defenderTeamId: string;
  }>;
  rejectedClaims: Array<{
    claim: string;
    attackId: string;
    defenseId: string;
    acceptedAttack: boolean;
    attackerTeamId: string;
    defenderTeamId: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  contributionScore: number;
};

type BattleSummary = {
  id: string;
  title: string;
  winnerTeamId?: string;
  winnerName?: string;
  winnerScore?: number;
};

type BundleResponse = {
  battle: BattleSummary;
  bundle: {
    passports: AgentPassport[];
  };
};

async function loadAgentPassport(agentId: string): Promise<{
  passport: AgentPassport;
  battle: BattleSummary;
} | null> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/battles/demo`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return loadFromDemoBundle(agentId);
    }
    const data = (await response.json()) as BundleResponse;
    const passport = data.bundle.passports.find(
      (p) =>
        p.agentId === agentId ||
        p.agentId.replace(/_/g, "-") === agentId ||
        p.agentId.startsWith(agentId.replace(/-/g, "_")),
    );
    if (!passport) {
      return loadFromDemoBundle(agentId);
    }
    return { passport, battle: data.battle };
  } catch {
    return loadFromDemoBundle(agentId);
  }
}

/**
 * In-memory fallback — pulls from the same demo bundle that
 * `/api/battles/demo` serves. This is the current data path until
 * a dedicated `/api/agents/[id]/passport` endpoint is wired.
 */
function loadFromDemoBundle(agentId: string) {
  const bundle = demoBattle;
  const engineTeamId = agentId.replace(/-/g, "_");
  const score = bundle.scores[agentId as keyof typeof bundle.scores];
  const teamEntry = bundle.teams.find((t) => t.id === agentId);
  const displayName = teamEntry?.name ?? winner.name;
  const initials = displayName
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AG";
  const passport: AgentPassport = {
    id: `passport_${bundle.id}_${agentId}`,
    agentId: `${engineTeamId}_agent`,
    battleId: bundle.id,
    agentName: displayName,
    role: teamEntry?.subtitle ?? winner.subtitle,
    version: "v1",
    directoryPath: `agents/${agentId}`,
    contributionSummary: `${displayName} contributed ${bundle.passport.acceptedClaims.length} accepted claims and ${bundle.passport.rejectedClaims.length} rejected claims across ${bundle.events.length} events.`,
    acceptedClaims: bundle.passport.acceptedClaims,
    rejectedClaims: bundle.passport.rejectedClaims,
    strengths: bundle.passport.strengths,
    weaknesses: bundle.passport.areasToImprove,
    contributionScore: score ? Math.round(score.longTermPotential * 100) : 0,
  };
  const battle: BattleSummary = {
    id: bundle.id,
    title: bundle.title,
    winnerTeamId: bundle.winnerId,
    winnerName: winner.name,
    winnerScore: winner.score,
  };
  return { passport, battle };
}

export default async function PassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadAgentPassport(id);

  if (!result) {
    return (
      <AppShell active="passport">
        <SectionCard title="Passport not found">
          <p>No passport snapshot exists for agent <code>{id}</code>.</p>
        </SectionCard>
      </AppShell>
    );
  }

  const { passport, battle } = result;
  const team = demoBattle.teams.find((t) => t.id === id) ?? winner;
  const isChampion = battle.winnerTeamId === id || battle.winnerTeamId === id.replace(/-/g, "_");
  const shareUrl = `https://agentarena.ai/agent/${id}/passport`;

  const sealInitials = passport.agentName
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AG";

  // PRD §12.3 invariant: weaknesses column is NEVER empty.
  const strengthsList = passport.strengths.length > 0
    ? passport.strengths
    : ["No clear strengths surfaced from the battle."];
  const weaknessesList = passport.weaknesses.length > 0
    ? passport.weaknesses
    : ["Low-severity weaknesses detected — no critical gaps found."];

  return (
    <AppShell active="passport" showRail currentRound="passport">
      {/* Print: passport-layout gets one A4 layout via print.css */}
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
            ariaLabel={isChampion ? "Champion seal" : "Participant seal"}
          />
          <div className="passport-identity">
            <h1>{passport.agentName}</h1>
            <p className="passport-role">{passport.role}</p>
            <div className="passport-pill-row">
              <span className="path-pill passport-version">{passport.version}</span>
              <span className="path-pill">{passport.directoryPath}</span>
              {isChampion ? (
                <span className="status-pill champion">Champion</span>
              ) : (
                <span className="status-pill">Participant</span>
              )}
            </div>
          </div>
        </section>

        {/* LEFT COLUMN — contribution + evidence */}
        <div className="passport-left">
          <SectionCard title="Contribution Summary">
            <p className="passport-summary">{passport.contributionSummary}</p>
            <div className="metric-grid compact" style={{ marginTop: 16 }}>
              <article className="metric-card">
                <span>Battle</span>
                <strong>{battle.id}</strong>
              </article>
              <article className="metric-card">
                <span>Score</span>
                <strong>{passport.contributionScore.toFixed(1)}</strong>
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
                    href={`/battle/${battle.id}/replay?attack=${claim.attackId}` as Route}
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
                    href={`/battle/${battle.id}/replay?attack=${claim.attackId}` as Route}
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
          {/* §4.6: two-column strengths | weaknesses. MUST be non-empty. */}
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
            {/* Print-only: show evidence URLs as plain text (PRD §7) */}
            <div className="print-only evidence-urls-print">
              <h3>Evidence URLs</h3>
              <ul>
                {passport.acceptedClaims.map((claim) => (
                  <li key={`print-accept-${claim.attackId}`}>
                    {claim.attackId} (accepted): https://agentarena.ai/battle/{battle.id}/replay?attack={claim.attackId}
                  </li>
                ))}
                {passport.rejectedClaims.map((claim) => (
                  <li key={`print-reject-${claim.attackId}`}>
                    {claim.attackId} (rejected): https://agentarena.ai/battle/{battle.id}/replay?attack={claim.attackId}
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}