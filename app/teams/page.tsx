import { BarChart3, Star, Swords, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MiniStat, QuoteBand, TeamProfileCard } from "@/components/arena-cards";
import { teams } from "@/lib/demo-data";

export default function TeamsPage() {
  return (
    <AppShell active="teams" showRail currentRound="cross_attack">
      <div className="page-heading">
        <h1>Teams</h1>
        <p>The teams that enter the arena.</p>
      </div>
      <section className="stats-strip">
        <MiniStat icon={<BarChart3 size={22} />} label="Average Win Rate" value="68.7%" note="Across all teams" />
        <MiniStat icon={<Star size={22} />} label="Top Specialty" value="Tech Offensive" note="Most common focus" />
        <MiniStat icon={<Swords size={22} />} label="Recent Battles" value="24" note="In the last 7 days" />
        <MiniStat icon={<UsersRound size={22} />} label="Total Teams" value="5" note="Active in the arena" />
      </section>
      <section className="team-profile-grid">
        {teams.map((team) => (
          <TeamProfileCard key={team.id} team={team} />
        ))}
        <TeamProfileCard
          team={{
            id: "judge-panel",
            name: "Judge Panel",
            subtitle: "Fair. Thorough. Impartial.",
            strategy: "Independent judges evaluating proposals with a critical eye.",
            color: "orange",
            score: 0,
            avatar: "JP",
            skills: ["Evaluation", "Fairness", "Expertise"],
            spark: [1, 2]
          }}
        />
        <TeamProfileCard
          team={{
            id: "artifact-writer",
            name: "Artifact Writer",
            subtitle: "Clarity in Every Word",
            strategy: "Crafts clear artifacts that communicate the winning plan.",
            color: "blue",
            score: 0,
            avatar: "AW",
            skills: ["Documentation", "Clarity", "Storytelling"],
            spark: [1, 2]
          }}
        />
      </section>
      <QuoteBand>Teams compete head-to-head in battles. Judges evaluate. The best ideas move forward.</QuoteBand>
    </AppShell>
  );
}
