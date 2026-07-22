import Link from "next/link";
import type { Route } from "next";
import { Plus, Search, Eye } from "lucide-react";
import { TeamAvatar } from "@/components/arena-cards";
import { getDemoBundle, getTeams } from "@/lib/demo-data";
import type { Team } from "@/lib/types";

type BattleRow = {
  id: string;
  label: string;
  idea: string;
  winner: Team | null;
  score: string;
  completed: string;
  status: "Live" | "Completed" | "Canceled";
  timeRange: "Today" | "Week" | "All time";
};

// Format ISO timestamp → human-friendly elapsed string.
function formatElapsed(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeRangeOf(iso: string): BattleRow["timeRange"] {
  const days = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 1) return "Today";
  if (days < 7) return "Week";
  return "All time";
}

/**
 * Battles table — server component.
 *
 * Renders the demo battle (always present) plus the canonical Sprint 2.5
 * demo battles. For Sprint 3, this component will read from the
 * battle store via `listBundles()` once multiple-battle support lands.
 */
export function BattlesTable() {
  const demo = getDemoBundle();
  const teams = getTeams();

  // Map engine team IDs → UI team IDs.
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const rows: BattleRow[] = [
    {
      id: demo.battle.id,
      label: "Battle #42",
      idea: demo.battle.idea,
      winner: teams.find((t) => t.id === demo.battle.winnerTeamId?.replace(/_/g, "-")) ?? null,
      score: demo.scores
        .find((s) => s.teamId === demo.battle.winnerTeamId)
        ? Math.round(
            (demo.scores.find((s) => s.teamId === demo.battle.winnerTeamId)?.totalScore ?? 0) * 10,
          ) / 10 + ""
        : "—",
      completed: formatElapsed(demo.battle.createdAt),
      status: "Completed",
      timeRange: timeRangeOf(demo.battle.createdAt),
    },
  ];

  return (
    <section className="section-card">
      <div className="battle-filters">
        <label>
          <Search size={18} />
          <input placeholder="Search battles..." disabled />
        </label>
        <select disabled aria-label="Status">
          <option>All</option>
        </select>
        <select disabled aria-label="Winner">
          <option>All</option>
        </select>
        <select disabled aria-label="Time range">
          <option>All time</option>
        </select>
        <Link href="/battle/new" className="primary-action">
          <Plus size={16} />
          New Battle
        </Link>
      </div>

      <p className="battles-explainer" style={{ color: "var(--fg-muted)", fontSize: "14px", margin: "0 0 16px" }}>
        Showing {rows.length} battle{rows.length === 1 ? "" : "s"} from the seeded demo.
        Multi-battle history ships once Postgres is connected.
      </p>

      <div role="table" aria-label="Battles list">
        {rows.map((row) => (
          <article key={row.id} className="battle-row" role="row">
            <div className="battle-cell" role="cell">
              <strong>{row.label}</strong>
              <span className="muted" style={{ color: "var(--fg-muted)", fontSize: "12px" }}>
                {row.completed}
              </span>
            </div>
            <div className="battle-cell" role="cell">
              <p className="battle-idea">{row.idea}</p>
            </div>
            <div className="battle-cell" role="cell">
              {row.winner ? (
                <span className="battle-winner">
                  <TeamAvatar team={row.winner} size="sm" />
                  <span>{row.winner.name}</span>
                </span>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
            <div className="battle-cell" role="cell">
              <strong>{row.score}</strong>
            </div>
            <div className="battle-cell" role="cell">
              <span className={`status-pill ${row.status === "Completed" ? "done" : row.status === "Live" ? "live" : "neutral"}`}>
                {row.status}
              </span>
            </div>
            <div className="battle-cell" role="cell">
              <Link href={`/battle/demo` as Route} className="text-link">
                <Eye size={14} /> Replay
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
