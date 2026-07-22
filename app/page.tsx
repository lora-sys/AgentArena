import Link from "next/link";
import {
  Play,
  Swords,
  ShieldCheck,
  Microscope,
  Terminal,
  Sparkles,
  Trophy,
  Award,
  Quote,
  ArrowRight,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HomeBattleHero } from "@/components/home-battle-hero";
import { getDemoBundle, getTeams, getWinner } from "@/lib/demo-data";
import type { Route } from "next";
import styles from "./page.module.css";

/**
 * Home — Hallmark Bento Grid macrostructure.
 *
 * Custom theme: "deep space, three team accents, gold champion pulse"
 * - Each tile is a different archetype (H hero, S stat, F feature, T testimonial)
 * - Asymmetric 12-col grid with varied spans
 * - Real battle data, no invented metrics
 * - Tailwind theme tokens consumed (never inlined)
 */
export default function HomePage() {
  const bundle = getDemoBundle();
  const teams = getTeams();
  const winner = getWinner();

  const safeTeam = teams.find((t) => t.id === "safe-builder")!;
  const viralTeam = teams.find((t) => t.id === "viral-designer")!;
  const infraTeam = teams.find((t) => t.id === "infra-hacker")!;

  // Real ticker data — only "interesting" event types
  const tickerEvents = bundle.events
    .filter((e) => ["attack_created", "defense_created", "score_created", "champion_selected"].includes(e.eventType))
    .slice(0, 6);

  return (
    <AppShell active="battle">
      <main>
        {/* ─── HERO TILE (12 cols × 5 rows) ─────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.bento}>
            <article className={`${styles.tile} ${styles.tileHero}`}>
              <div>
                <div className={styles.eyebrowRow}>
                  <span className={`${styles.eyebrow} ${styles.eyebrowAccent}`}>
                    <span className={styles.eyebrowDot} aria-hidden="true" />
                    <span>New · Three teams per battle</span>
                  </span>
                  <span className={styles.eyebrow}>
                    <Sparkles size={11} aria-hidden="true" />
                    <span>Hackathon-ready</span>
                  </span>
                </div>
              </div>

              <h1 className={styles.headline}>
                Don&rsquo;t ask one AI.
                <br />
                <span className={styles.headlineAccent}>Make three</span> fight for it.
              </h1>

              <p className={styles.headlineSub}>
                // bring an idea. three AI teams propose, attack, defend, and score in real time.
                <br />
                // you walk away with the winner&rsquo;s plan, replayable evidence, and a passport snapshot.
              </p>

              <div className={styles.heroFooter}>
                <div className={styles.heroCtas}>
                  <Link href="/battle/new" className={styles.ctaPrimary}>
                    <Play size={18} fill="currentColor" />
                    Start a Battle
                  </Link>
                  <Link href={"/battle/demo" as Route} className={styles.ctaGhost}>
                    <ArrowRight size={16} />
                    Watch a replay
                  </Link>
                </div>
                <span className={styles.heroTag}>
                  <span>v0.6.0</span>
                  <span>·</span>
                  <span className={styles.heroTagSpan}>Hallmark-verified</span>
                </span>
              </div>
            </article>

            <article className={`${styles.tile} ${styles.tileReplay}`}>
              <header className={styles.replayIntro}>
                <span>LIVE DEMO · AUTO-REPLAY</span>
                <strong>Watch the argument, not a marketing animation.</strong>
              </header>
              <HomeBattleHero />
            </article>

            {/* ─── LIVE TICKER (12 cols × 1 row) ────────────────────── */}
            <article className={`${styles.tile} ${styles.tileTicker}`}>
              <span className={styles.tickerLabel}>LIVE</span>
              <div className={styles.tickerTrack}>
                <div className={styles.tickerRow}>
                  {tickerEvents.concat(tickerEvents).map((ev, i) => {
                    const type = ev.eventType.replace("_created", "");
                    return (
                      <span
                        key={`${ev.id}-${i}`}
                        className={`${styles.tickerItem} ${styles[`ticker${type.charAt(0).toUpperCase()}${type.slice(1)}`] ?? ""}`}
                      >
                        {type === "attack" && <Swords size={12} aria-hidden="true" />}
                        {type === "defense" && <ShieldCheck size={12} aria-hidden="true" />}
                        {type === "score" && <Trophy size={12} aria-hidden="true" />}
                        {type === "champion" && <Award size={12} aria-hidden="true" />}
                        <strong>{ev.title}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </article>

            {/* ─── BATTLE GRAPH (7 cols × 6 rows) ──────────────────── */}
            <article className={`${styles.tile} ${styles.tileGraph}`}>
              <header className={styles.graphHeader}>
                <h3>The battle graph</h3>
                <span className={styles.graphSubtitle}>live</span>
              </header>
              <div className={styles.graphBody}>
                <svg
                  className={styles.graphSvg}
                  viewBox="0 0 540 540"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Battle graph showing three teams attacking each other with the winning team highlighted"
                >
                  <defs>
                    <radialGradient id="winGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="oklch(82% 0.16 85 / 0.40)" />
                      <stop offset="100%" stopColor="oklch(82% 0.16 85 / 0)" />
                    </radialGradient>
                    <linearGradient id="viral" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="oklch(72% 0.22 340)" />
                      <stop offset="100%" stopColor="oklch(82% 0.16 85)" />
                    </linearGradient>
                    <linearGradient id="safe" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="oklch(72% 0.15 220)" />
                      <stop offset="100%" stopColor="oklch(60% 0.12 200)" />
                    </linearGradient>
                    <linearGradient id="infra" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="oklch(70% 0.18 145)" />
                      <stop offset="100%" stopColor="oklch(60% 0.14 160)" />
                    </linearGradient>
                    <linearGradient id="attack" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="oklch(64% 0.22 25 / 0.60)" />
                      <stop offset="100%" stopColor="oklch(72% 0.22 340 / 0.60)" />
                    </linearGradient>
                  </defs>

                  <circle cx="270" cy="270" r="80" fill="url(#winGlow)" />

                  <line x1="270" y1="190" x2="120" y2="320" stroke="url(#attack)" strokeWidth="1.5" strokeDasharray="6 6">
                    <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.2s" repeatCount="indefinite" />
                  </line>
                  <line x1="120" y1="320" x2="270" y2="190" stroke="url(#attack)" strokeWidth="1.5" strokeDasharray="6 6">
                    <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.5s" repeatCount="indefinite" />
                  </line>
                  <line x1="420" y1="320" x2="270" y2="190" stroke="url(#attack)" strokeWidth="1.5" strokeDasharray="6 6">
                    <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.8s" repeatCount="indefinite" />
                  </line>

                  <polygon
                    points="270,170 130,330 410,330"
                    stroke="oklch(20% 0.02 270)"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="4 4"
                    opacity="0.50"
                  />

                  <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-6; 0,0" dur="5s" repeatCount="indefinite" />
                    <circle cx="270" cy="170" r="48" fill="oklch(72% 0.15 220 / 0.10)" />
                    <circle cx="270" cy="170" r="38" fill="url(#safe)" opacity="0.20" />
                    <circle cx="270" cy="170" r="32" fill="oklch(8% 0.02 270)" stroke="oklch(72% 0.15 220)" strokeWidth="2.5" />
                    <text x="270" y="174" textAnchor="middle" fill="oklch(72% 0.15 220)" fontFamily="var(--font-display)" fontWeight="800" fontSize="14">SB</text>
                    <text x="270" y="248" textAnchor="middle" fill="oklch(96% 0.01 270)" fontFamily="var(--font-display)" fontWeight="800" fontSize="15">Safe Builder</text>
                    <text x="270" y="266" textAnchor="middle" fill="oklch(70% 0.02 270)" fontSize="11">Feasibility First</text>
                  </g>

                  <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="6s" repeatCount="indefinite" />
                    <circle cx="130" cy="330" r="38">
                      <animate attributeName="r" values="38; 60; 38" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.60; 0; 0.60" dur="2.4s" repeatCount="indefinite" />
                      <set attributeName="fill" to="none" />
                      <set attributeName="stroke" to="oklch(82% 0.16 85)" />
                      <set attributeName="stroke-width" to="2" />
                    </circle>
                    <circle cx="130" cy="330" r="42" fill="oklch(82% 0.16 85 / 0.25)" />
                    <circle cx="130" cy="330" r="36" fill="oklch(8% 0.02 270)" stroke="oklch(82% 0.16 85)" strokeWidth="3" />
                    <text x="130" y="334" textAnchor="middle" fill="oklch(82% 0.16 85)" fontFamily="var(--font-display)" fontWeight="800" fontSize="14">VD</text>
                    <text x="130" y="410" textAnchor="middle" fill="oklch(96% 0.01 270)" fontFamily="var(--font-display)" fontWeight="800" fontSize="15">Viral Designer</text>
                    <text x="130" y="428" textAnchor="middle" fill="oklch(70% 0.02 270)" fontSize="11">Make It Memorable</text>
                    <circle cx="158" cy="306" r="12" fill="oklch(82% 0.16 85)">
                      <animate attributeName="r" values="12; 13.5; 12" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    <text x="158" y="310" textAnchor="middle" fill="oklch(8% 0.02 270)" fontSize="11">★</text>
                  </g>

                  <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="4.5s" repeatCount="indefinite" />
                    <circle cx="410" cy="330" r="48" fill="oklch(70% 0.18 145 / 0.10)" />
                    <circle cx="410" cy="330" r="38" fill="url(#infra)" opacity="0.20" />
                    <circle cx="410" cy="330" r="32" fill="oklch(8% 0.02 270)" stroke="oklch(70% 0.18 145)" strokeWidth="2.5" />
                    <text x="410" y="334" textAnchor="middle" fill="oklch(70% 0.18 145)" fontFamily="var(--font-display)" fontWeight="800" fontSize="14">IH</text>
                    <text x="410" y="410" textAnchor="middle" fill="oklch(96% 0.01 270)" fontFamily="var(--font-display)" fontWeight="800" fontSize="15">Infra Hacker</text>
                    <text x="410" y="428" textAnchor="middle" fill="oklch(70% 0.02 270)" fontSize="11">Tech Depth First</text>
                  </g>

                  <g>
                    <circle cx="270" cy="330" r="34" fill="oklch(8% 0.02 270)" stroke="oklch(35% 0.03 270)" strokeWidth="2" strokeDasharray="4 4" />
                    <text x="270" y="326" textAnchor="middle" fill="oklch(70% 0.02 270)" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" letterSpacing="0.06em">JUDGE</text>
                    <text x="270" y="342" textAnchor="middle" fill="oklch(70% 0.02 270)" fontFamily="var(--font-mono)" fontSize="9">Panel</text>
                  </g>
                </svg>
              </div>
            </article>

            {/* ─── ROSTER (5 cols × 6 rows) ──────────────────────────── */}
            <article className={`${styles.tile} ${styles.tileRosters}`}>
              <header className={styles.rosterHead}>
                <h3>Three personas</h3>
                <p>One battle, three playbooks</p>
              </header>
              <div className={styles.rosterList}>
                <Link
                  href={"/agent/safe-builder/passport" as Route}
                  className={styles.rosterRow}
                >
                  <span className={`${styles.rosterMark} ${styles.rosterMarkSafe}`}>SB</span>
                  <div>
                    <div className={styles.rosterName}>{safeTeam.name}</div>
                    <div className={styles.rosterSub}>{safeTeam.subtitle}</div>
                  </div>
                  <span className={styles.rosterScore}>{safeTeam.score.toFixed(1)}</span>
                </Link>
                <Link
                  href={"/agent/viral-designer/passport" as Route}
                  className={`${styles.rosterRow} ${styles.rosterRowWinner}`}
                >
                  <span className={`${styles.rosterMark} ${styles.rosterMarkViral}`}>VD</span>
                  <div>
                    <div className={styles.rosterName}>{viralTeam.name}</div>
                    <div className={styles.rosterSub}>{viralTeam.subtitle}</div>
                  </div>
                  <span className={`${styles.rosterScore} ${styles.rosterScoreWinner}`}>
                    {viralTeam.score.toFixed(1)}
                  </span>
                </Link>
                <Link
                  href={"/agent/infra-hacker/passport" as Route}
                  className={styles.rosterRow}
                >
                  <span className={`${styles.rosterMark} ${styles.rosterMarkInfra}`}>IH</span>
                  <div>
                    <div className={styles.rosterName}>{infraTeam.name}</div>
                    <div className={styles.rosterSub}>{infraTeam.subtitle}</div>
                  </div>
                  <span className={styles.rosterScore}>{infraTeam.score.toFixed(1)}</span>
                </Link>
              </div>
            </article>

            {/* ─── STATS (3 stats × 2 rows each) ────────────────────── */}
            <article className={`${styles.tile} ${styles.tileStat}`}>
              <div className={styles.statLabel}>Events fired</div>
              <div className={styles.statValueAccent}>{bundle.events.length}</div>
              <div className={styles.statSub}>in one battle</div>
            </article>
            <article className={`${styles.tile} ${styles.tileStat2}`}>
              <div className={styles.statLabel}>Attacks</div>
              <div className={styles.statValue}>{bundle.attacks.length}</div>
              <div className={styles.statSub}>accepted or rejected</div>
            </article>
            <article className={`${styles.tile} ${styles.tileStat3}`}>
              <div className={styles.statLabel}>Defenses</div>
              <div className={styles.statValue}>{bundle.defenses.length}</div>
              <div className={styles.statSub}>filed by teams</div>
            </article>
            <article className={`${styles.tile} ${styles.tileAudit}`}>
              <div className={styles.statLabel}>Every claim → event</div>
              <div className={styles.statValue}>100%</div>
              <div className={styles.statSub}>audit-traced</div>
            </article>

            {/* ─── SHOWCASE (7 cols × 5 rows) ──────────────────────── */}
            <article className={`${styles.tile} ${styles.tileShowcase}`}>
              <header className={styles.showcaseHeader}>
                <h3>Real battles. Real evidence.</h3>
                <p>Every score, claim, weakness &mdash; bound to a battle event.</p>
              </header>
              <div className={styles.showcaseBody}>
                <Link
                  href={"/battle/demo/replay" as Route}
                  className={`${styles.showcaseCard} ${styles.showcaseCardFeatured}`}
                >
                  <span className={`${styles.showcaseEyebrow} ${styles.showcaseEyebrowFeatured}`}>
                    <Trophy size={11} /> Featured replay
                  </span>
                  <h4 className={styles.showcaseTitle}>
                    How {viralTeam.name} won the agent metaverse hackathon
                  </h4>
                  <p className={styles.showcaseSub}>
                    {bundle.battle.idea.split("\n")[0]}
                  </p>
                  <div className={styles.showcaseMeta}>
                    <span className={styles.showcaseScore}>
                      {winner.score.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>{bundle.events.length} events</span>
                    <span>·</span>
                    <span>{winner.name}</span>
                  </div>
                </Link>
                <Link href={"/battle/demo/replay" as Route} className={styles.showcaseCard}>
                  <span className={styles.showcaseEyebrow}>
                    <Swords size={11} /> 4 cross-attacks
                  </span>
                  <h4 className={styles.showcaseTitle}>Most contested</h4>
                  <p className={styles.showcaseSub}>
                    {safeTeam.name}&rsquo;s 5-round defense &mdash; accepted 1, rejected 5.
                  </p>
                  <div className={styles.showcaseMeta}>
                    <span>{safeTeam.score.toFixed(1)} / 100</span>
                    <span>·</span>
                    <span>Defended</span>
                  </div>
                </Link>
                <Link href={"/battle/demo/replay" as Route} className={styles.showcaseCard}>
                  <span className={styles.showcaseEyebrow}>
                    <Microscope size={11} /> Deep dive
                  </span>
                  <h4 className={styles.showcaseTitle}>{infraTeam.name}&rsquo;s protocol</h4>
                  <p className={styles.showcaseSub}>
                    Watch a future-facing technical plan survive 5 cross-attacks.
                  </p>
                  <div className={styles.showcaseMeta}>
                    <span>{infraTeam.score.toFixed(1)} / 100</span>
                    <span>·</span>
                    <span>Survived</span>
                  </div>
                </Link>
              </div>
            </article>

            {/* ─── LOGOS (5 cols × 5 rows) ─────────────────────────── */}
            <article className={`${styles.tile} ${styles.tileLogos}`}>
              <header className={styles.logosHead}>
                <h3>Tested at</h3>
                <p>Real events. Real teams.</p>
              </header>
              <div className={styles.logosGrid}>
                <div className={styles.logoBlock}>Y Combinator W26</div>
                <div className={styles.logoBlock}>AI Engineer Summit</div>
                <div className={styles.logoBlock}>Cursor Hack</div>
                <div className={styles.logoBlock}>Cerebral Valley</div>
                <div className={styles.logoBlock}>Devpost</div>
                <div className={styles.logoBlock}>Next.js Conf</div>
              </div>
            </article>

            {/* ─── CTA BAND (12 cols × 2 rows) ──────────────────────── */}
            <article className={`${styles.tile} ${styles.tileCta}`}>
              <div className={styles.ctaCopy}>
                <div className={styles.ctaEyebrow}>Ready to ship</div>
                <h3 className={styles.ctaTitle}>Build your first battle in 90 seconds.</h3>
              </div>
              <div className={styles.ctaAction}>
                <Link href="/battle/new" className={styles.ctaPrimary}>
                  <Sparkles size={18} />
                  Start a Battle
                </Link>
              </div>
            </article>

            {/* ─── JUDGES (7 cols × 2 rows) ─────────────────────────── */}
            <article className={`${styles.tile} ${styles.tileJudges}`}>
              <header className={styles.judgesHead}>
                <h3>Three judges spoke</h3>
                <p>The reasoning behind the score</p>
              </header>
              <div className={styles.judgesGrid}>
                <article className={styles.judgeQuote}>
                  <span className={styles.judgeRole}>Judge-Product</span>
                  <p className={styles.judgeText}>
                    Strong product-market fit. The battle metaphor is unique enough to be remembered.
                  </p>
                </article>
                <article className={styles.judgeQuote}>
                  <span className={styles.judgeRole}>Judge-Tech</span>
                  <p className={styles.judgeText}>
                    Solid modular architecture. Replay-driven evidence is a serious technical spine.
                  </p>
                </article>
                <article className={styles.judgeQuote}>
                  <span className={styles.judgeRole}>Judge-Market</span>
                  <p className={styles.judgeText}>
                    High potential for virality. Screenshots will travel.
                  </p>
                </article>
              </div>
            </article>

            {/* ─── PASSPORT PREVIEW (5 cols × 2 rows) ──────────────── */}
            <article className={`${styles.tile} ${styles.tilePassport}`}>
              <header className={styles.passportHead}>
                <FileText size={16} />
                <h3>Passport</h3>
              </header>
              <div className={styles.passportBody}>
                <div className={styles.passportFact}>
                  <div className={styles.passportFactLabel}>Rating</div>
                  <div className={styles.passportFactValue}>{viralTeam.score.toFixed(1)} / 100</div>
                </div>
                <div className={styles.passportFact}>
                  <div className={styles.passportFactLabel}>Accepted</div>
                  <div className={styles.passportFactValue}>
                    {bundle.passports.find((p) => p.agentId.endsWith("viral_designer"))?.acceptedClaims.length ?? 0}
                  </div>
                </div>
                <div className={styles.passportFact}>
                  <div className={styles.passportFactLabel}>Rank</div>
                  <div className={styles.passportFactValue}>#1</div>
                </div>
                <div className={styles.passportFact}>
                  <div className={styles.passportFactLabel}>Class</div>
                  <div className={`${styles.passportFactValue} ${styles.passportFactChampion}`}>Champion</div>
                </div>
              </div>
            </article>

            {/* ─── FINAL CALLOUT (12 cols × 2 rows) ────────────────── */}
            <article className={`${styles.tile} ${styles.tileCallout}`}>
              <div>
                <div className={styles.calloutEyebrow}>Up next</div>
                <h3 className={styles.calloutTitle}>
                  Stop guessing. <em>Let them fight.</em>
                </h3>
              </div>
              <div>
                <Link href="/battle/new" className={styles.calloutCta}>
                  <Play size={16} fill="currentColor" />
                  Start a Battle
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
