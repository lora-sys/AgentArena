import Link from "next/link";
import { Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtifactViewer } from "@/components/artifact-viewer";
import { ChampionHero, Scoreboard, SectionCard } from "@/components/arena-cards";

export default function BattleResultPage() {
  return (
    <AppShell active="battle">
      <div className="result-meta">
        <Link href="/battles">Back to Battles</Link>
        <strong>Battle #42</strong>
        <span>Round 2: Cross Attack</span>
        <span className="status-pill done">Completed</span>
      </div>
      <ChampionHero />
      <section className="result-grid">
        <div>
          <SectionCard title="Judge Scoreboard">
            <Scoreboard />
          </SectionCard>
          <SectionCard title="Judge Comments">
            <div className="judge-comments">
              <p>
                <strong>Judge-Product</strong> Excellent product-market fit and strong differentiation.
              </p>
              <p>
                <strong>Judge-Tech</strong> Solid modular architecture with a credible event-log story.
              </p>
              <p>
                <strong>Judge-Market</strong> High potential for virality and retention.
              </p>
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Artifact Viewer" action={<a href="/api/battles/demo/export"><Download size={16} /> Download</a>}>
            <ArtifactViewer />
          </SectionCard>
          <SectionCard title="Why It Won">
            <p>
              Viral Designer stood out for its differentiated battle metaphor, strong demo experience, and event-backed
              path toward agent reputation.
            </p>
            <div className="pill-row">
              <span className="soft-pill purple">Most Novel</span>
              <span className="soft-pill purple">Best Demo Experience</span>
              <span className="soft-pill purple">Strong Long-term Potential</span>
            </div>
          </SectionCard>
        </div>
      </section>
    </AppShell>
  );
}
