import Link from "next/link";
import { BarChart3, Play, ShieldCheck, Trophy, Swords, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BattlesTable } from "@/components/battles-table";
import { getDemoBundle } from "@/lib/demo-data";
import styles from "./page.module.css";
import type { Route } from "next";

/**
 * Battles page — Hallmark asymmetric stat strip + table.
 */

export default function BattlesPage() {
  const demo = getDemoBundle();
  const totalEvents = demo.events.length;
  const totalAttacks = demo.attacks.length;
  const totalDefenses = demo.defenses.length;
  const totalPassports = demo.passports.length;

  return (
    <AppShell active="battles" showRail currentRound="cross_attack">
      <div className={styles.page}>
        <header className={styles.head}>
          <span className={styles.headEyebrow}>Battle archive</span>
          <h1>
            Every <em>battle.</em> Every event. Every score.
          </h1>
          <p className={styles.headSub}>
            Replays of battles that have already happened. Click any row to
            open the full timeline and inspect the evidence.
          </p>
        </header>

        {/* Asymmetric 4-tile stat strip (first wider) */}
        <section className={styles.statStrip} aria-label="Battle archive stats">
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <BarChart3 size={20} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.statLabel}>Total events</span>
              <span className={`${styles.statValue} ${styles.statValueAccent}`}>
                {totalEvents}
              </span>
            </div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <Play size={20} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.statLabel}>Attacks fired</span>
              <span className={styles.statValue}>{totalAttacks}</span>
            </div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.statLabel}>Defenses</span>
              <span className={styles.statValue}>{totalDefenses}</span>
            </div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <Trophy size={20} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.statLabel}>Passports</span>
              <span className={styles.statValue}>{totalPassports}</span>
            </div>
          </article>
        </section>

        <section className={styles.featured} aria-label="Featured battle moments">
          <header>
            <span className={styles.headEyebrow}>Featured moments</span>
            <h2>Start with the turning point.</h2>
            <p>Jump straight into the attack that forced the eventual champion to concede a fatal weakness.</p>
          </header>
          <Link href={"/battle/demo?view=evidence" as Route} className={styles.featuredCard}>
            <span><Swords size={16} /> Gotcha moment</span>
            <strong>Safe Builder lands a high-severity feasibility attack.</strong>
            <small>Viral Designer accepts the core flaw, revises the plan, then wins on the strength of that recovery.</small>
            <b>Inspect verified evidence <ArrowRight size={14} /></b>
          </Link>
        </section>

        <div className={styles.tableSection}>
          <BattlesTable />
        </div>
      </div>
    </AppShell>
  );
}
