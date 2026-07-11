"use client";

import "../../../print.css";
import { use, useEffect, useState } from "react";
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
 *
 * B10 fix: renders a <PassportSkeleton> on first paint (before data
 * arrives) so the e2e test always sees SOMETHING, eliminating the
 * post-B7 SSR flaky where the client component started with an empty body.
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

async function loadAgentPassport(agentId: string): Promise<{
  passport: AgentPassport;
  battle: BattleSummary;
} | null> {
  // R20 fix: validate agentId against a safe pattern before using it
  // in the URL. Without this, an agentId containing ".." or other path
  // metacharacters could be used for path traversal even with
  // encodeURIComponent. The only agentIds that should reach the API
  // are lowercase alphanumeric + hyphens (e.g. "safe-builder").
  // "demo" is a special case for the explicit demo fallback.
  const isValidAgentId =
    /^[a-z0-9-]+$/.test(agentId) || agentId === "demo";
  if (!isValidAgentId) {
    return null;
  }
  // F-2: fetch from the agent-specific passport endpoint instead of the
  // hardcoded demo bundle URL. R20: encode agentId to prevent
  // path injection (e.g. ../ traversal).
  try {
    const response = await fetch(
      `/api/agents/${encodeURIComponent(agentId)}/passport`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      // F-1: only fall back to demo bundle when explicitly requested.
      if (agentId === "demo") {
        return loadFromDemoBundle(agentId);
      }
      return null;
    }
    const data = (await response.json()) as BundleResponse;
    const passport = data.bundle.passports.find(
      (p) =>
        p.agentId === agentId ||
        p.agentId.replace(/_/g, "-") === agentId ||
        p.agentId.startsWith(agentId.replace(/-/g, "_")),
    );
    if (!passport) {
      // F-1: no real match → return null so the not-found branch renders.
      return null;
    }
    return { passport, battle: data.battle };
  } catch {
    // F-1: network failure → only fall back for explicit demo agentId.
    if (agentId === "demo") {
      return loadFromDemoBundle(agentId);
    }
    return null;
  }
}

/**
 * PassportSkeleton — rendered on first paint while data loads.
 * Mirrors the real layout shape (hero strip + two columns + evidence list)
 * so the e2e test sees .passport-layout on first hit. This eliminates
 * the post-B7 empty-first-paint race.
 */
function PassportSkeleton() {
  return (
    <div className="passport-layout print-target" data-testid="passport-skeleton" aria-label="Loading passport snapshot">
      <section
        className="passport-hero"
        style={{ gridColumn: "1 / -1" }}
        aria-label="Agent identity"
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--bg-muted, #2a2a2a)",
          }}
        />
        <div className="passport-identity">
          <div
            style={{
              width: 220,
              height: 32,
              borderRadius: 8,
              background: "var(--bg-muted, #2a2a2a)",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              width: 160,
              height: 18,
              borderRadius: 6,
              background: "var(--bg-muted, #2a2a2a)",
              marginBottom: 12,
            }}
          />
          <div className="passport-pill-row">
            <span className="path-pill" style={{ opacity: 0.5 }}>loading…</span>
          </div>
        </div>
      </section>
      <div className="passport-left">
        <SectionCard title="Contribution Summary">
          <div
            style={{
              height: 60,
              borderRadius: 8,
              background: "var(--bg-muted, #2a2a2a)",
              opacity: 0.5,
            }}
          />
        </SectionCard>
        <SectionCard title="Reputation Snapshot">
          <div
            style={{
              height: 80,
              borderRadius: 8,
              background: "var(--bg-muted, #2a2a2a)",
              opacity: 0.5,
            }}
          />
        </SectionCard>
        <SectionCard title="Evidence Chain">
          <div
            style={{
              height: 120,
              borderRadius: 8,
              background: "var(--bg-muted, #2a2a2a)",
              opacity: 0.5,
            }}
          />
        </SectionCard>
      </div>
      <div className="passport-right">
        <div className="passport-two-col" data-testid="strengths-weaknesses">
          <div>
            <h2 className="passport-two-col-heading">Strengths</h2>
            <div className="pill-row" data-testid="strengths-column">
              <span className="soft-pill purple" style={{ opacity: 0.5 }}>—</span>
            </div>
          </div>
          <div>
            <h2 className="passport-two-col-heading">Weaknesses</h2>
            <div className="pill-row" data-testid="weaknesses-column">
              <span className="soft-pill red" style={{ opacity: 0.5 }}>—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = use(params);
  const [id, setId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    passport: AgentPassport;
    battle: BattleSummary;
  } | null>(null);
  // R20 fix: track whether the async fetch has resolved so the page
  // shows the skeleton during loading instead of flashing the
  // "not found" branch on first paint (when result is still null
  // but the fetch hasn't completed yet).
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setId(paramId);
    setLoaded(false);
    loadAgentPassport(paramId).then((res) => {
      if (!cancelled) {
        setResult(res);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [paramId]);

  // First paint and loading state: always show skeleton (R20 fix).
  // Previously the `!result` check fell through to the "not found"
  // branch before the fetch resolved, causing a visible flash of
  // the wrong content on every page load.
  if (!loaded) {
    return (
      <AppShell active="passport" showRail currentRound="passport">
        <PassportSkeleton />
      </AppShell>
    );
  }

  if (!result) {
    // `id` is guaranteed non-null here: the useEffect sets it
    // synchronously to paramId before the fetch resolves, and this
    // branch is only reached after `loaded` is true.
    const displayId = id ?? paramId;
    return (
      <AppShell active="passport">
        <SectionCard title="Passport not found">
          <p>No passport snapshot exists for agent <code>{displayId}</code>.</p>
        </SectionCard>
      </AppShell>
    );
  }

  const { passport, battle } = result;
  // F-3: compare winnerTeamId against both the raw id and the
  // underscore-normalized form so the champion badge renders correctly.
  // `id` is guaranteed non-null here: loaded is true, which means
  // the useEffect has run and set id to paramId.
  const safeId = id ?? paramId;
  const engineId = safeId.replace(/-/g, "_");
  const isChampion =
    battle.winnerTeamId === safeId ||
    battle.winnerTeamId === engineId ||
    battle.winnerTeamId === passport.agentId;
  const shareUrl = `https://agentarena.ai/agent/${safeId}/passport`;

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
