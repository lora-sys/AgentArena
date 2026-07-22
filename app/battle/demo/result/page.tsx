import Link from "next/link";
import { Download, Quote, Play, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ChampionHero, Scoreboard } from "@/components/arena-cards";
import { getDemoBattle, getDemoBundle, getTeams, getWinner } from "@/lib/demo-data";
import type { Route } from "next";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

export function DemoResultSurface() {
  const bundle = getDemoBundle();
  const teams = getTeams();
  const winner = getWinner();
  const demoBattle = getDemoBattle();

  const podium = [...teams]
    .filter((t) => ["safe-builder", "viral-designer", "infra-hacker"].includes(t.id))
    .sort((a, b) => b.score - a.score);

  return (
    <AppShell active="battle">
      <div className={styles.page}>
        <section className={styles.hero} aria-label="Champion ceremony">
          <span className={styles.heroEyebrow}><span>Battle complete</span></span>
          <h1 className={styles.heroTitle}>
            <span className={`${styles.heroLine} ${styles.heroLineAccent}`}>
              {winner.name}<em> won.</em>
            </span>
            <span className={`${styles.heroLine} ${styles.heroLineWhite}`}>Three teams.</span>
            <span className={`${styles.heroLine} ${styles.heroLineWhite}`}><em>{bundle.events.length}</em> events.</span>
            <span className={`${styles.heroLine} ${styles.heroLineWhite}`}>Six attacks.</span>
            <span className={`${styles.heroLine} ${styles.heroLineAccent}`}><em>One</em> champion.</span>
          </h1>
          <p className={styles.heroSub}>
            // real AI agents · real attacks · real evidence
            <br />
            // {bundle.events.length} events fired · {bundle.attacks.length} attacks · {bundle.defenses.length} defenses · {bundle.scores.length} scores
          </p>
          <div className={styles.podium} aria-label="Top three finishers">
            <article className={styles.podiumSlot}>
              <span className={styles.podiumMedal}>2</span>
              <strong className={styles.podiumName}>{podium[1].name}</strong>
              <span className={styles.podiumSub}>{podium[1].subtitle}</span>
              <span className={styles.podiumScore}>{podium[1].score.toFixed(1)}</span>
            </article>
            <article className={`${styles.podiumSlot} ${styles.podiumSlotFirst}`}>
              <span className={`${styles.podiumMedal} ${styles.podiumMedalGold}`}>1</span>
              <strong className={`${styles.podiumName} ${styles.podiumNameWinner}`}>{podium[0].name}</strong>
              <span className={styles.podiumSub}>{podium[0].subtitle}</span>
              <span className={`${styles.podiumScore} ${styles.podiumScoreWinner}`}>{podium[0].score.toFixed(1)}</span>
              <span className={styles.podiumCrown}>★ Champion</span>
            </article>
            <article className={styles.podiumSlot}>
              <span className={styles.podiumMedal}>3</span>
              <strong className={styles.podiumName}>{podium[2].name}</strong>
              <span className={styles.podiumSub}>{podium[2].subtitle}</span>
              <span className={styles.podiumScore}>{podium[2].score.toFixed(1)}</span>
            </article>
          </div>
        </section>

        <ChampionHero />

        <section className={styles.section} aria-label="Evidence chain">
          <header className={styles.sectionHead}>
            <span className={styles.sectionEyebrow}>Audit trail</span>
            <h2>Every score is bound to a <em>battle event.</em></h2>
            <p className={styles.sectionSub}>
              The Passport Snapshot below cites real event IDs from the demo.
            </p>
          </header>
          <div className={styles.evidenceGrid}>
            <Scoreboard teams={teams} scores={demoBattle.scores} winnerId={winner.id} />
          </div>
        </section>

        <section className={styles.section} aria-label="Judge comments">
          <header className={styles.sectionHead}>
            <span className={styles.sectionEyebrow}>Three judges spoke</span>
            <h2>The reasoning behind <em>the score.</em></h2>
          </header>
          <div className={styles.judgesGrid}>
            <article className={styles.judgeQuote}>
              <Quote size={20} aria-hidden="true" />
              <p>&ldquo;Excellent product-market fit and strong differentiation. The battle metaphor is unique enough to be remembered.&rdquo;</p>
              <footer><strong>Judge-Product</strong> · Product-market fit</footer>
            </article>
            <article className={styles.judgeQuote}>
              <Quote size={20} aria-hidden="true" />
              <p>&ldquo;Solid modular architecture with a credible event-log story. Replay-driven evidence is a serious technical spine.&rdquo;</p>
              <footer><strong>Judge-Tech</strong> · Architecture</footer>
            </article>
            <article className={styles.judgeQuote}>
              <Quote size={20} aria-hidden="true" />
              <p>&ldquo;High potential for virality and retention. Screenshots will travel &mdash; and every one is tied to a battle event.&rdquo;</p>
              <footer><strong>Judge-Market</strong> · Distribution</footer>
            </article>
          </div>
        </section>

        <section className={styles.section} aria-label="Generated artifacts">
          <header className={styles.sectionHead}>
            <span className={styles.sectionEyebrow}>What you walk away with</span>
            <h2>Six ready-to-share <em>artifacts.</em></h2>
          </header>
          <div className={styles.artifactGrid}>
            <div>
              <p className={styles.sectionSub}>Battle brief · PRD · Architecture · Demo script · Pitch · TODO.</p>
            </div>
            <a href="/api/battles/demo/export" className={styles.exportCard}>
              <Download size={28} aria-hidden="true" />
              <strong>Download full Markdown export</strong>
              <span>Every claim, every event, every score &mdash; in one file.</span>
              <ArrowRight size={16} className={styles.exportArrow} />
            </a>
          </div>
        </section>

        <div className={styles.callout}>
          <div>
            <div className={styles.calloutEyebrow}>Up next</div>
            <h3 className={styles.calloutTitle}>Watch the full <em>replay</em></h3>
          </div>
          <div>
            <Link href={"/battle/demo/replay" as Route} className={styles.calloutCta}>
              <Play size={16} fill="currentColor" /> Open Replay
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function LegacyDemoResultPage() {
  redirect("/battle/demo?view=result" as Route);
}
