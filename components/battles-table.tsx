"use client";

import Link from "next/link";
import type { Route } from "next";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TeamAvatar } from "@/components/arena-cards";
import type { Team } from "@/lib/types";

// Static team stubs (mirror the 3 built-in teams) — kept inline so this
// client component does not pull in @/lib/demo-data → @/arena/* → @/lib/db/*.
const DEMO_TEAMS: Team[] = [
  { id: "safe-builder",   name: "Safe Builder",   subtitle: "落地派", strategy: "MVP scope + risk control", color: "blue",   score: 0, avatar: "🛡", skills: [], spark: [] },
  { id: "viral-designer", name: "Viral Designer", subtitle: "传播派", strategy: "Demo wow + share loop",  color: "purple", score: 0, avatar: "✦", skills: [], spark: [] },
  { id: "infra-hacker",   name: "Infra Hacker",   subtitle: "技术派", strategy: "Protocol-grade depth",   color: "green",  score: 0, avatar: "▲", skills: [], spark: [] },
];

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

const rows: BattleRow[] = [
  {
    id: "demo",
    label: "Battle #42",
    idea: "How might we build a privacy-first AI copilot that helps teams move faster?",
    winner: DEMO_TEAMS[0],
    score: "72.4",
    completed: "Just now",
    status: "Live",
    timeRange: "Today"
  },
  {
    id: "battle-41",
    label: "Battle #41",
    idea: "How might we reduce onboarding time for enterprise SaaS platforms?",
    winner: DEMO_TEAMS[1],
    score: "78.6",
    completed: "2 hours ago",
    status: "Completed",
    timeRange: "Today"
  },
  {
    id: "battle-40",
    label: "Battle #40",
    idea: "How might we increase developer productivity with AI automation?",
    winner: DEMO_TEAMS[2],
    score: "74.1",
    completed: "Yesterday",
    status: "Completed",
    timeRange: "Week"
  },
  {
    id: "battle-39",
    label: "Battle #39",
    idea: "How might we improve customer support with AI agents?",
    winner: DEMO_TEAMS[0],
    score: "68.3",
    completed: "May 10, 2025",
    status: "Completed",
    timeRange: "All time"
  },
  {
    id: "battle-38",
    label: "Battle #38",
    idea: "How might we build a sustainable pricing model for AI products?",
    winner: null,
    score: "-",
    completed: "May 9, 2025",
    status: "Canceled",
    timeRange: "All time"
  }
];

export function BattlesTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [winner, setWinner] = useState("All");
  const [timeRange, setTimeRange] = useState("All time");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const queryMatch =
        normalizedQuery.length === 0 ||
        row.label.toLowerCase().includes(normalizedQuery) ||
        row.idea.toLowerCase().includes(normalizedQuery) ||
        row.winner?.name.toLowerCase().includes(normalizedQuery);
      const statusMatch = status === "All" || row.status === status;
      const winnerMatch = winner === "All" || row.winner?.name === winner;
      const timeMatch = timeRange === "All time" || row.timeRange === timeRange || (timeRange === "Last 7 days" && row.timeRange !== "All time");
      return queryMatch && statusMatch && winnerMatch && timeMatch;
    });
  }, [query, status, winner, timeRange]);

  return (
    <section className="section-card">
      <div className="battle-filters">
        <label>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search battles..." />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status">
          <option>All</option>
          <option>Live</option>
          <option>Completed</option>
          <option>Canceled</option>
        </select>
        <select value={winner} onChange={(event) => setWinner(event.target.value)} aria-label="Winner">
          <option>All</option>
          {DEMO_TEAMS.map((team) => (
            <option key={team.id}>{team.name}</option>
          ))}
        </select>
        <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} aria-label="Time Range">
          <option>All time</option>
          <option>Today</option>
          <option>Last 7 days</option>
        </select>
        <Link href="/battle/new" className="primary-action small">
          <Plus size={16} />
          New Battle
        </Link>
      </div>
      <div className="battle-table">
        <div className="table-head">
          <span>Battle</span>
          <span>Idea Summary</span>
          <span>Winner</span>
          <span>Total Score</span>
          <span>Completed</span>
          <span>Actions</span>
        </div>
        {filteredRows.map((row) => (
          <div key={row.id} className="table-row">
            <strong>
              {row.label}
              <span className={`status-pill ${row.status === "Live" ? "live" : row.status === "Completed" ? "done" : "neutral"}`}>
                {row.status}
              </span>
            </strong>
            <p>{row.idea}</p>
            <span className="winner-cell">
              {row.winner ? (
                <>
                  <TeamAvatar team={row.winner} size="sm" />
                  {row.winner.name}
                </>
              ) : (
                "No winner"
              )}
            </span>
            <b>{row.score}</b>
            <span>{row.completed}</span>
            <span className="action-cell">
              <Link href={`/battle/${row.id}/replay` as Route}>Replay</Link>
              <Link href={`/battle/${row.id}/result` as Route}>Result</Link>
            </span>
          </div>
        ))}
        {filteredRows.length === 0 ? <p className="empty-state">No battles match these filters.</p> : null}
      </div>
    </section>
  );
}
