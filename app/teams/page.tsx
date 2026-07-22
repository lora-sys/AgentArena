import { Sparkles, Swords, ShieldCheck, Award, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { QuoteBand, TeamProfileCard } from "@/components/arena-cards";
import { getDemoBundle, getTeams } from "@/lib/demo-data";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

/**
 * Teams page — Hallmark "Persona Wall" macrostructure.
 * Real stats from demo bundle, no fabricated numbers.
 */
export default function TeamsPage() {
  redirect("/#teams");
  const teams = getTeams();
  const bundle = getDemoBundle();

  // Real data from bundle.
  const totalAttacks = bundle.attacks.length;
  const totalDefenses = bundle.defenses.length;
  const totalAccepted = bundle.passports.reduce(
    (acc, p) => acc + p.acceptedClaims.length,
    0,
  );

  return (
    <AppShell active="teams" showRail currentRound="cross_attack">
      <div className={styles.page}>
        <header className={styles.head}>
          <span className={styles.headEyebrow}>Persona Wall</span>
          <h1>
            Five <em>specialist</em> personas enter the arena.
          </h1>
          <p className={styles.headSub}>
            Three teams compete head-to-head. A judge panel scores them on six
            rubric dimensions. An artifact writer packages the winner. Every
            claim is bound to a real battle event.
          </p>
        </header>

        {/* Asymmetric 4-tile stat strip */}
        <section className={styles.statStrip} aria-label="Team activity stats">
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <Swords size={20} aria-hidden="true" />
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
              <span className={styles.statLabel}>Defenses filed</span>
              <span className={styles.statValue}>{totalDefenses}</span>
            </div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <Award size={20} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.statLabel}>Accepted claims</span>
              <span className={styles.statValue}>{totalAccepted}</span>
            </div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}>
              <Trophy size={20} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.statLabel}>Active personas</span>
              <span className={styles.statValueAccent}>{teams.length}</span>
            </div>
          </article>
        </section>

        {/* 5 personas (existing TeamProfileCard component) */}
        <section className="team-profile-grid">
          {teams.map((team) => (
            <TeamProfileCard key={team.id} team={team} />
          ))}
        </section>

        <div className={styles.quoteSection}>
          <QuoteBand>
            Three teams compete head-to-head. A judge panel scores them on
            six rubric dimensions. An artifact writer packages the winner.
            Every claim is bound to a battle event.
          </QuoteBand>
        </div>
      </div>
    </AppShell>
  );
}
