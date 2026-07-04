import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  DefenseList,
  EventLog,
  ProposalComparison,
  ReplayShareCard,
  Scoreboard,
  SectionCard,
  TeamAvatar
} from "@/components/arena-cards";
import { ReplayControls, ReplayModeTabs } from "@/components/replay-controls";
import { demoBattle, teams } from "@/lib/demo-data";

export default function BattleReplayPage() {
  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <div className="replay-header">
        <div>
          <h1>Battle Replay: Agent Metaverse Hackathon</h1>
          <ReplayModeTabs />
        </div>
        <ReplayControls elapsed={demoBattle.elapsed} duration={demoBattle.duration} />
      </div>

      <section className="replay-grid">
        <div>
          <SectionCard className="versus-card">
            <span className="status-pill live">LIVE replay</span>
            <h2>Cross Attack Moment</h2>
            <p>Safe Builder attacked Viral Designer.</p>
            <div className="versus-row">
              <TeamAvatar team={teams[0]} size="lg" />
              <strong>VS</strong>
              <TeamAvatar team={teams[1]} size="lg" />
            </div>
          </SectionCard>
          <SectionCard title="Proposal Comparison">
            <ProposalComparison />
          </SectionCard>
          <SectionCard title="Defense & Rebuttal">
            <DefenseList />
          </SectionCard>
          <SectionCard title="Event Log">
            <EventLog />
          </SectionCard>
          <ReplayShareCard />
        </div>
        <div>
          <SectionCard title="Judge Scoreboard Snapshot">
            <Scoreboard compact />
          </SectionCard>
          <SectionCard title="Replay Viewer" action={<Link href="/battle/demo/live"><Maximize2 size={16} /> Fullscreen</Link>}>
            <div className="video-card">
              <TeamAvatar team={teams[0]} size="lg" />
              <strong>VS</strong>
              <TeamAvatar team={teams[1]} size="lg" />
              <span className="video-progress"><i /></span>
              <small>Cross Attack - Round 2</small>
            </div>
          </SectionCard>
        </div>
      </section>
    </AppShell>
  );
}
