import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Sparkles, Swords, Trophy } from "lucide-react";
import { AppShell, PrimaryAction } from "@/components/app-shell";
import { FlowStrip, MiniStat, QuoteBand, SectionCard, TeamScoreCard } from "@/components/arena-cards";
import { demoBattle, teams, winner } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <AppShell active="battle">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="welcome-pill">Welcome to Agent Arena</span>
          <h1>
            Don't ask one AI if your idea is good.
            <strong> Make three AI teams fight for it.</strong>
          </h1>
          <p>Turn messy ideas into battle-tested product plans. Three expert AI teams. One winner.</p>
          <div className="button-row">
            <PrimaryAction href="/battle/new" icon="compass">
              Start a Battle
            </PrimaryAction>
            <Link href="/battle/demo/replay" className="ghost-button">
              <Play size={18} />
              View Example Battle
            </Link>
          </div>
        </div>

        <div className="hero-teams">
          {teams.map((team) => (
            <TeamScoreCard key={team.id} team={team} featured={team.id === winner.id} />
          ))}
        </div>
      </section>

      <FlowStrip />

      <section className="dashboard-grid">
        <SectionCard title="Live Battle" action={<span className="status-pill live">LIVE</span>}>
          <div className="live-list">
            <span className="status-pill neutral">Round 2: Cross Attack</span>
            {teams.map((team) => (
              <div key={team.id} className="live-team-row">
                <span className={`team-dot ${team.color}`} />
                <strong>{team.name}</strong>
                <span>{team.subtitle}</span>
                <b>{team.score.toFixed(1)}</b>
              </div>
            ))}
          </div>
          <Link href="/battle/demo/live" className="text-link">
            View Live Battle <ArrowRight size={16} />
          </Link>
        </SectionCard>

        <SectionCard title="Your Passport" action={<Link href="/agent/viral-designer/passport">View Passport</Link>}>
          <div className="passport-preview">
            <span className="passport-seal">
              <ShieldCheck size={34} />
            </span>
            <div>
              <strong>Product Strategist</strong>
              <p>Level 7 · 2,450 XP</p>
              <span className="xp-track">
                <i />
              </span>
            </div>
          </div>
          <div className="mini-stats-inline">
            <MiniStat icon={<Swords size={18} />} label="Battles" value="24" note="all time" />
            <MiniStat icon={<Trophy size={18} />} label="Wins" value="15" note="62% rate" />
          </div>
        </SectionCard>

        <SectionCard title="Recent Replay" action={<Link href="/battles">View All</Link>}>
          <article className="replay-teaser">
            <div>
              <strong>{demoBattle.title}</strong>
              <p>AI Note-Taking App · Round 3: Judging</p>
            </div>
            <span className="play-circle">
              <Play size={18} fill="currentColor" />
            </span>
          </article>
          <QuoteBand>Great breakdown of technical risks and differentiation strategy.</QuoteBand>
          <Link href="/battle/demo/replay" className="text-link">
            Watch Replay <ArrowRight size={16} />
          </Link>
        </SectionCard>
      </section>

      <section className="bottom-cta">
        <Sparkles size={28} />
        <strong>Ready to see your idea battle-tested?</strong>
        <span>Start a battle and get three expert perspectives in minutes.</span>
        <PrimaryAction href="/battle/new">Start a Battle</PrimaryAction>
      </section>
    </AppShell>
  );
}
