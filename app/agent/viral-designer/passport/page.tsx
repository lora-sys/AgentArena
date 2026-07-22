import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ArrowRight, Download, FileText, Printer } from "lucide-react";
import { getDemoBundle, getDemoBattle, getWinner } from "@/lib/demo-data";
import type { Route } from "next";
import styles from "./page.module.css";

/**
 * Passport page — Hallmark Specimen Fact-Sheet macrostructure.
 * Single-column audit document. Mono data, numbered sections, gold passport seal.
 * The page IS the artifact.
 */
export default function ViralDesignerPassportPage() {
  const bundle = getDemoBundle();
  const battle = getDemoBattle();
  const winner = getWinner();
  const winnerPassport = bundle.passports.find((p) => p.agentId.endsWith("viral_designer"));
  const accepted = winnerPassport?.acceptedClaims ?? [];
  const rejected = winnerPassport?.rejectedClaims ?? [];
  const score = bundle.scores.find((s) => s.teamId === "viral_designer");
  const globalRank = 1;

  return (
    <AppShell active="passport" showRail currentRound="passport">
      <div className={styles.page}>
        <article className={styles.document}>
          <header className={styles.docHeader}>
            <span className={styles.docSerial}>Passport · PP-BTL42-VRLDSGNR · Issued 2026-07-04</span>

            <h1 className={styles.docTitle}>{winner.name}</h1>
            <p className={styles.docRole}>{winner.subtitle} · Make It Memorable</p>

            <div className={styles.seal}>
              <div className={styles.sealInner}>VD</div>
            </div>
          </header>

          {/* ─── FACT SHEET (Specimen-style 2-col grid) ─── */}
          <div className={styles.factGrid}>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Rating</span>
              <span className={`${styles.factValue} ${styles.factValueAccent}`}>
                {winner.score.toFixed(1)}<span style={{ fontSize: "0.6em", color: "var(--fg-muted)" }}> / 100</span>
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Global rank</span>
              <span className={styles.factValue}>#{globalRank}</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Accepted claims</span>
              <span className={styles.factValue}>{accepted.length}</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Rejected claims</span>
              <span className={styles.factValue}>{rejected.length}</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Rubric novelty</span>
              <span className={styles.factValue}>
                {score ? score.scores.novelty.toFixed(1) : "—"}/10
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Rubric demo wow</span>
              <span className={styles.factValue}>
                {score ? score.scores.demoWow.toFixed(1) : "—"}/10
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Long-term potential</span>
              <span className={styles.factValue}>
                {score ? score.scores.longTermPotential.toFixed(1) : "—"}/10
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Events cited</span>
              <span className={styles.factValue}>3</span>
            </div>
          </div>

          {/* ─── SECTION 1: Accepted claims ──────────────── */}
          <section className={styles.section}>
            <span className={styles.sectionNumber}>Accepted claims · 03</span>
            <h2 className={styles.sectionTitle}>Every claim cites a real battle event</h2>
            <p className={styles.sectionCopy}>
              {accepted.length > 0
                ? `${accepted.length} claim${accepted.length === 1 ? "" : "s"} survived cross-attack pressure and were admitted into the passport. Each is bound to a real event in the demo.`
                : "No accepted claims recorded."}
            </p>
            {accepted.map((claim, i) => (
              <div key={i} className={styles.evidenceRow} data-tone="accept" data-marker="✓">
                <span className={styles.evidenceEvent}>
                  ↳ {claim.attackId}
                </span>
                <span className={styles.evidenceClaim}>
                  {claim.claim}
                </span>
              </div>
            ))}
          </section>

          {/* ─── SECTION 2: Rejected claims ──────────────── */}
          <section className={styles.section}>
            <span className={styles.sectionNumber}>Rejected claims · {String(rejected.length).padStart(2, "0")}</span>
            <h2 className={styles.sectionTitle}>Where the proposal was beaten</h2>
            <p className={styles.sectionCopy}>
              {rejected.length} claim{rejected.length === 1 ? "" : "s"} were struck down by cross-attacks. They count as real vulnerability evidence.
            </p>
            {rejected.map((claim, i) => (
              <div key={i} className={styles.evidenceRow} data-tone="reject" data-marker="✗">
                <span className={styles.evidenceEvent}>
                  ↳ {claim.attackId}
                </span>
                <span className={styles.evidenceClaim}>
                  {claim.claim}
                </span>
              </div>
            ))}
          </section>

          {/* ─── SECTION 3: Battle context ───────────────── */}
          <section className={styles.section}>
            <span className={styles.sectionNumber}>Battle context · 01</span>
            <h2 className={styles.sectionTitle}>Where this passport was issued</h2>
            <p className={styles.sectionCopy}>
              <strong style={{ color: "var(--fg)" }}>{battle.title}</strong>
              <br />
              {battle.idea.split("\n")[0]}
            </p>
            <span className={styles.sectionSub}>
              Team ID: {score?.teamId ?? "—"}
            </span>
          </section>

          {/* ─── ACTIONS (Specimen vertical row) ──────── */}
          <div className={styles.actions}>
            <Link
              href={"/battle/demo?view=evidence" as Route}
              className={styles.action}
            >
              <span><strong>Open full replay</strong> · every event, in order</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href={"/battle/demo?view=result" as Route}
              className={styles.action}
            >
              <span><strong>Back to result</strong> · podium + scoreboard</span>
              <ArrowRight size={16} />
            </Link>
            <a href="/api/battles/demo/export" className={styles.action}>
              <span><strong>Download Markdown export</strong></span>
              <Download size={16} />
            </a>
            <button type="button" className={styles.action}>
              <span><strong>Print this passport</strong> · A4 layout</span>
              <Printer size={16} />
            </button>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
