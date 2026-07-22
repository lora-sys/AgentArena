import Link from "next/link";
import { Compass, Sparkles, Play, Swords, ShieldCheck, Trophy, ArrowRight, Quote } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getDemoBundle, getDemoBattle } from "@/lib/demo-data";
import type { Route } from "next";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

/**
 * Explore — Hallmark "Replay Hub" macrostructure.
 * Asymmetric featured replay card + 3-tile vault + dark CTA closing.
 */
export default function ExplorePage() {
  redirect("/battles?view=featured");
  const demo = getDemoBattle();
  const bundle = getDemoBundle();

  // Pick signature events for the "what an attack actually looks like" panel.
  const attackEvent = bundle.events.find((e) => e.eventType === "attack_created");
  const defenseEvent = bundle.events.find((e) => e.eventType === "defense_created");
  const scoreEvent = bundle.events.find((e) => e.eventType === "score_created");

  return (
    <AppShell active="explore">
      <div className={styles.page}>
        {/* ─── HERO ────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.hero}>
            <span className={styles.heroEyebrow}>
              <Compass size={14} />
              <span>Battle Replay Hub</span>
            </span>
            <h1 className={styles.heroTitle}>
              Watch <em>real AI agents</em>
              <br />
              fight, defend, and score.
            </h1>
            <p className={styles.heroSub}>
              Every replay below is built from a real battle event log.
              Click any cell to drill into the exact moment a claim was made &mdash;
              and the evidence that proved or disproved it.
            </p>
            <Link href={"/battle/demo/replay" as Route} className={styles.heroCta}>
              <Play size={18} fill="currentColor" />
              Open the full demo replay
            </Link>
          </div>
        </section>

        {/* ─── FEATURED REPLAY (single big card with 3 inner cards) ─── */}
        <section className={styles.featured} aria-label="Featured replay">
          <header className={styles.featuredHead}>
            <span className={styles.featuredEyebrow}>Featured this week</span>
            <h2>
              The <em>most-attacked proposal</em> in our public replays.
            </h2>
          </header>

          <article className={styles.featuredCard}>
            <header className={styles.featuredHeadRow}>
              <h3 className={styles.featuredTitle}>
                {demo.idea.split("\n")[0]}
              </h3>
              <p className={styles.featuredSub}>Agent Metaverse Hackathon</p>
            </header>

            <div className={styles.featuredGrid}>
              <article className={styles.replayCard}>
                <span className={`${styles.replayCardType} ${styles.replayCardTypeAttack}`}>
                  <Swords size={12} /> Attack
                </span>
                <p className={styles.replayCardClaim}>
                  &ldquo;{attackEvent?.title ?? "—"}&rdquo;
                </p>
                <span className={styles.replayCardEvent}>
                  ↳ {attackEvent?.id ?? "—"}
                </span>
              </article>

              <article className={styles.replayCard}>
                <span className={`${styles.replayCardType} ${styles.replayCardTypeDefense}`}>
                  <ShieldCheck size={12} /> Defense
                </span>
                <p className={styles.replayCardClaim}>
                  &ldquo;{defenseEvent?.title ?? "—"}&rdquo;
                </p>
                <span className={styles.replayCardEvent}>
                  ↳ {defenseEvent?.id ?? "—"}
                </span>
              </article>

              <article className={styles.replayCard}>
                <span className={`${styles.replayCardType} ${styles.replayCardTypeScore}`}>
                  <Trophy size={12} /> Score
                </span>
                <p className={styles.replayCardClaim}>
                  &ldquo;{scoreEvent?.title ?? "—"}&rdquo;
                </p>
                <span className={styles.replayCardEvent}>
                  ↳ {scoreEvent?.id ?? "—"}
                </span>
              </article>
            </div>
          </article>
        </section>

        {/* ─── COLLECTION: 3 replay picks ──────────────── */}
        <section className={styles.collection} aria-label="Featured replays">
          <header className={styles.collectionHead}>
            <h2>
              Three replays worth <em>your time.</em>
            </h2>
          </header>

          <div className={styles.vaultGrid}>
            <Link
              href={"/battle/demo/replay?event=event_021" as Route}
              className={`${styles.vaultTile} ${styles.vaultAccentViral}`}
            >
              <span className={styles.vaultEyebrow}>
                <Quote size={10} /> Champion&rsquo;s playbook
              </span>
              <h3 className={styles.vaultTitle}>How Viral Designer won</h3>
              <p className={styles.vaultDesc}>
                6 attacks. 1 critical defense. Score cascade from 5.5 to 8.23.
              </p>
              <span className={styles.vaultArrow}>
                Open in replay <ArrowRight size={12} />
              </span>
            </Link>
            <Link
              href={"/battle/demo/replay?event=event_014" as Route}
              className={`${styles.vaultTile} ${styles.vaultAccentSafe}`}
            >
              <span className={styles.vaultEyebrow}>
                <Quote size={10} /> Most contested
              </span>
              <h3 className={styles.vaultTitle}>Safe Builder&rsquo;s 5-round defense</h3>
              <p className={styles.vaultDesc}>
                Accepted 1 attack, rejected 5. Highest evidence count of any team.
              </p>
              <span className={styles.vaultArrow}>
                Open in replay <ArrowRight size={12} />
              </span>
            </Link>
            <Link
              href={"/battle/demo/replay?event=event_013" as Route}
              className={`${styles.vaultTile} ${styles.vaultAccentInfra}`}
            >
              <span className={styles.vaultEyebrow}>
                <Quote size={10} /> Deep dive
              </span>
              <h3 className={styles.vaultTitle}>Infra Hacker&rsquo;s protocol pitch</h3>
              <p className={styles.vaultDesc}>
                Watch a future-facing technical plan take 5 separate cross-attacks.
              </p>
              <span className={styles.vaultArrow}>
                Open in replay <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </section>

        {/* ─── FINAL CTA ──────────────────────────────── */}
        <section className={styles.cta}>
          <Sparkles size={36} className={styles.ctaIcon} aria-hidden="true" />
          <h2 className={styles.ctaTitle}>
            Curiosity satisfied?<br />
            <em>Run one yourself.</em>
          </h2>
          <p className={styles.ctaSub}>
            Bring an idea. Three AI teams battle it out for 90 seconds. You
            walk away with a champion plan and a passport snapshot.
          </p>
          <Link href={"/battle/new" as Route} className={styles.ctaCta}>
            <Play size={16} fill="currentColor" />
            Start a Battle
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
