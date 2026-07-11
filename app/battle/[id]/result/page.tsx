"use client";

import { use, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Download, Play, Trophy, FileText, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  fetchBattleResult,
  BattleApiError,
  buildExportMarkdownUrl,
  buildReplayUrl,
  buildPassportUrl,
  type BattleResult,
  type BattleScoreRow,
  type BattleArtifact,
} from "@/lib/api-client";

/* ------------------------------------------------------------------ */
/* Loading / Error / Empty states                                      */
/* ------------------------------------------------------------------ */

function ResultSkeleton() {
  return (
    <div className="result-skeleton" role="status" aria-label="Loading battle result">
      <div className="skeleton-block skeleton-champion" />
      <div className="skeleton-block skeleton-scoreboard" />
      <div className="skeleton-block skeleton-artifacts" />
    </div>
  );
}

function ResultError({ message, status }: { message: string; status?: number }) {
  return (
    <div className="result-error" role="alert">
      <h2>Battle result unavailable</h2>
      <p>
        {status === 404
          ? "This battle could not be found. It may have been deleted or the ID is incorrect."
          : message}
      </p>
      <Link href="/" className="error-back-link">
        Back to Home <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Champion Card                                                       */
/* ------------------------------------------------------------------ */

function ChampionCard({ result }: { result: BattleResult }) {
  const winnerScore = result.scores.find((s) => s.teamId === result.winnerTeamId);
  const championEvidenceId = winnerScore?.evidenceEventId ?? "unknown";

  return (
    <section className="champion-card" aria-label="Champion">
      <div className="champion-seal" aria-hidden="true">
        <Trophy size={80} />
      </div>
      <div className="champion-info">
        <p className="champion-label">Champion</p>
        <h1 className="champion-name">{result.winnerName ?? "Undecided"}</h1>
        <p className="champion-meta">
          <strong className="champion-score">
            {result.winnerScore?.toFixed(1) ?? "—"}
          </strong>
          <span className="champion-score-suffix">/10</span>
          <span className="champion-pill" aria-label="Winner">Winner</span>
        </p>
        <p className="champion-idea">{result.idea}</p>
      </div>
      <div className="champion-evidence">
        <p className="evidence-label">Evidence</p>
        <code className="evidence-id" title="Champion selection event">
          {championEvidenceId}
        </code>
        {winnerScore?.winningReason && (
          <p className="winning-reason">&ldquo;{winnerScore.winningReason}&rdquo;</p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scoreboard with evidence tooltips                                   */
/* ------------------------------------------------------------------ */

const scoreDimensions: Array<{ key: keyof BattleScoreRow["scores"]; label: string }> = [
  { key: "novelty", label: "Novelty" },
  { key: "feasibility", label: "Feasibility" },
  { key: "demoWow", label: "Demo Wow" },
  { key: "technicalDepth", label: "Tech Depth" },
  { key: "userValue", label: "User Value" },
  { key: "longTermPotential", label: "Long-term" },
];

function Scoreboard({ scores }: { scores: BattleScoreRow[] }) {
  const ranked = [...scores].sort((a, b) => b.totalScore - a.totalScore);
  const rankLabels: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

  return (
    <div className="scoreboard" role="table" aria-label="Judge scoreboard">
      <div className="scoreboard-header" role="row">
        <span role="columnheader">Rank</span>
        <span role="columnheader">Team</span>
        <span role="columnheader">Total</span>
        {scoreDimensions.map((dim) => (
          <span key={dim.key} role="columnheader">
            {dim.label}
          </span>
        ))}
      </div>
      {ranked.map((score, index) => {
        const rank = index + 1;
        const isFirst = rank === 1;
        const rankLabel = rankLabels[rank] ?? `${rank}th`;
        return (
          <div
            key={score.teamId}
            className={`scoreboard-row ${isFirst ? "rank-first" : ""}`}
            role="row"
          >
            <span className="rank-cell" role="cell">
              <span aria-label={rankLabel}>{rank}</span>
            </span>
            <span className="team-cell" role="cell">
              <strong>{score.teamName}</strong>
            </span>
            <span className="total-cell" role="cell">
              <strong>{score.totalScore.toFixed(1)}</strong>
            </span>
            {scoreDimensions.map((dim) => (
              <span
                key={dim.key}
                className="score-cell"
                role="cell"
                tabIndex={0}
                title={`Evidence: ${score.evidenceEventId}`}
                aria-label={`${dim.label}: ${score.scores[dim.key].toFixed(1)}, evidence ${score.evidenceEventId}`}
              >
                <span className="score-value">{score.scores[dim.key].toFixed(1)}</span>
                <i
                  className="score-bar"
                  style={{ width: `${(score.scores[dim.key] / 10) * 100}%` }}
                  aria-hidden="true"
                />
                <span className="score-tooltip" role="tooltip">
                  ev: {score.evidenceEventId}
                </span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Artifact Download List                                              */
/* ------------------------------------------------------------------ */

function ArtifactList({ battleId, artifacts }: { battleId: string; artifacts: BattleArtifact[] }) {
  return (
    <div className="artifact-list">
      {artifacts.map((artifact) => (
        <a
          key={artifact.id}
          href={`/api/battles/${encodeURIComponent(battleId)}/export?artifact=${encodeURIComponent(artifact.type)}`}
          className="artifact-item"
          download
        >
          <FileText size={18} aria-hidden="true" />
          <span className="artifact-title">{artifact.title}</span>
          <Download size={16} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

export function ClientBattleResult({ params }: { params: Promise<{ id: string }> }) {
  const { id: battleIdParam } = use(params);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBattleId(battleIdParam);
    setResult(null);
    setLoading(true);
    setError(null);
    fetchBattleResult(battleIdParam)
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (err instanceof BattleApiError) {
            setError({ message: err.message, status: err.status });
          } else {
            setError({
              message: err instanceof Error ? err.message : "Unknown error",
            });
          }
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [battleIdParam]);

  return (
    <AppShell active="battle">
      <div className="result-meta">
        <Link href="/battles">Back to Battles</Link>
        {battleId && (
          <strong className="result-battle-id">{battleId}</strong>
        )}
        {result && <span className="status-pill done">Completed</span>}
      </div>

      {loading && <ResultSkeleton />}

      {error && <ResultError message={error.message} status={error.status} />}

      {result && battleId && (
        <>
          <ChampionCard result={result} />

          <section className="result-grid">
            <div>
              <h2 className="section-title">Judge Scoreboard</h2>
              <Scoreboard scores={result.scores} />
            </div>
            <div>
              <h2 className="section-title">Artifacts</h2>
              <ArtifactList battleId={battleId} artifacts={result.artifacts} />
            </div>
          </section>

          <nav className="result-actions" aria-label="Battle actions">
            <Link href={buildReplayUrl(battleId) as `/battle/${string}/replay`} className="action-btn action-primary">
              <Play size={16} fill="currentColor" />
              View Replay
            </Link>
            {result.winnerTeamId && (
              <Link
                href={buildPassportUrl(battleId, result.winnerTeamId) as `/agent/${string}/passport`}
                className="action-btn action-secondary"
              >
                <Trophy size={16} />
                View Passport
              </Link>
            )}
            <a
              href={buildExportMarkdownUrl(battleId)}
              className="action-btn action-secondary"
              download
            >
              <Download size={16} />
              Export Markdown
            </a>
          </nav>
        </>
      )}
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Server page — wraps ClientBattleResult in Suspense (R30 fix)       */
/* ------------------------------------------------------------------ */

type BattleResultPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BattleResultPage({ params }: BattleResultPageProps) {
  // Resolve params here so the client component receives the id.
  // The Suspense boundary is required because ClientBattleResult
  // uses React's `use(params)` hook, which suspends until the
  // promise resolves.
  await params;
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ClientBattleResult params={params} />
    </Suspense>
  );
}