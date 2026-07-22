import { Sparkles, ArrowRight, Swords, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BattleSetupForm } from "@/components/battle-setup-form";
import styles from "./page.module.css";

/**
 * Setup page — Hallmark Conversational Form macrostructure.
 * Hero ritual → 3-team roster (slide in) → form (one question at a time)
 * → payoff (6 artifact cards in 3-col grid).
 */
export default function NewBattlePage() {
  return (
    <AppShell active="battle">
      <div className={styles.page}>
        {/* ─── HERO RITUAL ─────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <Sparkles size={14} />
              <span>Summon the arena</span>
            </span>
            <h1 className={styles.headline}>
              Bring an idea.<br />
              <em>Watch three AI teams fight for it.</em>
            </h1>
            <p className={styles.sub}>
              Paste your messy idea below. Three teams — Safe Builder, Viral
              Designer, and Infra Hacker — will propose, attack, defend, and
              score in real time. You walk away with the winner&rsquo;s plan and a
              passport snapshot.
            </p>
          </div>

          {/* 3-team roster with slide-in animation */}
          <aside className={styles.roster} aria-label="Three teams entering the arena">
            <div className={`${styles.rosterCard} ${styles.rosterSafe}`}>
              <span className={styles.rosterMark}>SB</span>
              <div>
                <strong className={styles.rosterName}>Safe Builder</strong>
                <span className={styles.rosterSub}>Will play it safe.</span>
              </div>
            </div>
            <div className={`${styles.rosterCard} ${styles.rosterViral}`}>
              <span className={styles.rosterMark}>VD</span>
              <div>
                <strong className={styles.rosterName}>Viral Designer</strong>
                <span className={styles.rosterSub}>Will chase virality.</span>
              </div>
            </div>
            <div className={`${styles.rosterCard} ${styles.rosterInfra}`}>
              <span className={styles.rosterMark}>IH</span>
              <div>
                <strong className={styles.rosterName}>Infra Hacker</strong>
                <span className={styles.rosterSub}>Will go deep on tech.</span>
              </div>
            </div>
          </aside>
        </section>

        {/* ─── FORM (one question at a time) ────────────── */}
        <div className={styles.form}>
          <BattleSetupForm />
        </div>

        {/* ─── PAYOFF (6 artifacts in 3-col grid) ─────────── */}
        <section className={styles.payoff}>
          <header className={styles.payoffHead}>
            <h2>
              One battle. <em>Six artifacts.</em>
            </h2>
          </header>

          <ul className={styles.payoffGrid}>
            {[
              { t: "Product Brief", d: "Crystallized idea in one page.", icon: Sparkles },
              { t: "PRD", d: "Real problems, real solutions.", icon: Zap },
              { t: "Architecture", d: "How it'd be built.", icon: Swords },
              { t: "Demo Script", d: "60 seconds to wow judges.", icon: Sparkles },
              { t: "Pitch Outline", d: "Three slides, perfect order.", icon: Zap },
              { t: "TODO", d: "Your next 48 hours.", icon: Swords },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.t} className={styles.payoffItem}>
                  <span className={styles.payoffIcon}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <strong>{item.t}</strong>
                  <span>{item.d}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
