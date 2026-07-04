import Link from "next/link";
import { Clock3, Play } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  AttackList,
  DefenseList,
  JudgeProgress,
  ProposalComparison,
  QuoteBand,
  StatusPill,
  TeamScoreCard
} from "@/components/arena-cards";
import { demoBattle, teams } from "@/lib/demo-data";

export default function LiveBattlePage() {
  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <div className="live-header">
        <div>
          <h1>{demoBattle.title}</h1>
          <div className="meta-row">
            <StatusPill label="Round 2: Cross Attack" />
            <StatusPill label="LIVE" tone="live" />
          </div>
        </div>
        <span className="timer">
          <Clock3 size={20} />
          {demoBattle.elapsed}
        </span>
      </div>

      <section className="team-score-grid">
        {teams.map((team) => (
          <TeamScoreCard key={team.id} team={team} featured={team.id === "viral-designer"} />
        ))}
      </section>

      <section className="round-section">
        <h2>Round 1: Proposal Comparison</h2>
        <p>Each fixed Agent Team generates a distinct plan before the fight starts.</p>
        <ProposalComparison />
      </section>

      <section className="round-section">
        <h2>Round 2: Cross Attack</h2>
        <p>Teams attack each other's proposals.</p>
        <AttackList />
      </section>

      <section className="round-section">
        <h2>Round 3: Defense & Rebuttal</h2>
        <p>Teams accept or reject critiques and revise their plans.</p>
        <DefenseList />
      </section>

      <JudgeProgress />

      <div className="next-band">
        <QuoteBand>Next: teams move into Defense to respond and revise.</QuoteBand>
        <Link href="/battle/demo/replay" className="primary-action">
          <Play size={18} fill="currentColor" />
          View Replay
        </Link>
      </div>
    </AppShell>
  );
}
