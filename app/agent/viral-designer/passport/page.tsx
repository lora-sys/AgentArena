import { AppShell } from "@/components/app-shell";
import { ClaimList, PassportMetrics, SectionCard, TeamAvatar } from "@/components/arena-cards";
import { demoBattle, winner } from "@/lib/demo-data";

export default function PassportPage() {
  return (
    <AppShell active="passport" showRail currentRound="cross_attack">
      <section className="passport-layout">
        <div>
          <section className="passport-hero">
            <TeamAvatar team={winner} size="lg" />
            <div>
              <h1>{winner.name}</h1>
              <p>Demo-wow-first</p>
              <span className="path-pill">agents/viral-designer</span>
            </div>
          </section>

          <SectionCard title="Contribution Summary">
            <div className="metric-grid compact">
              <article className="metric-card"><span>Total Contributions</span><strong>27</strong></article>
              <article className="metric-card"><span>Accepted</span><strong>19</strong></article>
              <article className="metric-card"><span>Rejected</span><strong>8</strong></article>
              <article className="metric-card"><span>Impact Score</span><strong>78.6</strong></article>
            </div>
          </SectionCard>

          <SectionCard title="Recent Accepted Claims">
            <ClaimList type="accepted" />
          </SectionCard>

          <SectionCard title="Recent Rejected Claims">
            <ClaimList type="rejected" />
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Reputation Snapshot">
            <PassportMetrics />
            <h3>Strengths</h3>
            <div className="pill-row">
              {demoBattle.passport.strengths.map((strength) => (
                <span key={strength} className="soft-pill purple">
                  {strength}
                </span>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Areas to Improve">
            <div className="pill-row">
              {demoBattle.passport.areasToImprove.map((area) => (
                <span key={area} className="soft-pill red">
                  {area}
                </span>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Related Replays">
            <div className="related-list">
              {["Battle #41: Demo-wow-first vs Safe Builder", "Battle #39: Demo-wow-first vs Infra Hacker", "Battle #36: Demo-wow-first vs Judge-Tech"].map(
                (item) => (
                  <article key={item}>
                    <span className="play-circle">▶</span>
                    <p>{item}</p>
                    <span className="status-pill done">Win</span>
                  </article>
                )
              )}
            </div>
          </SectionCard>
        </div>
      </section>
    </AppShell>
  );
}
