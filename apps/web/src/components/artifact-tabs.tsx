import { useState } from "react";
import { t } from "../i18n";
import styles from "./artifact-tabs.module.css";

export type MiniAppDemoState = {
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  generated: string[];
};

const DIFFICULTY_LABEL: Record<MiniAppDemoState["difficulty"], string> = {
  easy: t("artifact.mini.difficulty.easy"),
  medium: t("artifact.mini.difficulty.medium"),
  hard: t("artifact.mini.difficulty.hard"),
};

const SAMPLE_QUESTIONS: Record<MiniAppDemoState["difficulty"], string[]> = {
  easy: [t("artifact.mini.question.easy_1"), t("artifact.mini.question.easy_2"), t("artifact.mini.question.easy_3")],
  medium: [t("artifact.mini.question.medium_1"), t("artifact.mini.question.medium_2"), t("artifact.mini.question.medium_3")],
  hard: [t("artifact.mini.question.hard_1"), t("artifact.mini.question.hard_2"), t("artifact.mini.question.hard_3")],
};

function StudyMiniAppDemo() {
  const [state, setState] = useState<MiniAppDemoState>({
    difficulty: "medium",
    questionCount: 10,
    generated: SAMPLE_QUESTIONS.medium,
  });

  const handleGenerate = () => {
    const pool = SAMPLE_QUESTIONS[state.difficulty];
    const generated = Array.from({ length: state.questionCount }, (_, i) => pool[i % pool.length]);
    setState((prev) => ({ ...prev, generated }));
  };

  return (
    <div className={styles.miniApp} data-testid="mini-app-demo">
      <header className={styles.miniAppHero}>
        <span>{t("artifact.mini.badge")}</span>
        <h4>{t("artifact.mini.title")}</h4>
        <p>{t("artifact.mini.body")}</p>
      </header>
      <div className={styles.miniAppControls}>
        <label>
          {t("artifact.mini.difficulty")}
          <select
            value={state.difficulty}
            onChange={(e) => setState((prev) => ({ ...prev, difficulty: e.target.value as MiniAppDemoState["difficulty"] }))}
          >
            {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          {t("artifact.mini.question_count")} {state.questionCount}
          <input
            type="range"
            min={5}
            max={20}
            value={state.questionCount}
            onChange={(e) => setState((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
          />
        </label>
        <button type="button" onClick={handleGenerate} className={styles.generateButton}>
          {t("artifact.mini.generate")} {state.questionCount} {t("artifact.mini.unit")}
        </button>
      </div>
      {state.generated.length > 0 && (
        <ol className={styles.questionList}>
          {state.generated.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function LiveArtifactMiniAppDemo({ artifactTitle, artifactSummary, artifactBadge }: { artifactTitle?: string; artifactSummary?: string; artifactBadge?: string }) {
  const [stepCount, setStepCount] = useState(8);
  const [generatedCount, setGeneratedCount] = useState(0);
  const title = artifactTitle ?? t("artifact.live_mini.default_title");
  const checks = [
    `${t("artifact.live_mini.check_claim")}：${title}`,
    t("artifact.live_mini.check_source"),
    t("artifact.live_mini.check_revision"),
    t("artifact.live_mini.check_alignment"),
  ];

  return (
    <div className={styles.miniApp} data-testid="mini-app-demo" data-variant="live-artifact">
      <header className={styles.miniAppHero}>
        <span>{artifactBadge ?? t("artifact.live_mini.badge")}</span>
        <h4>{title}</h4>
        <p>{artifactSummary ?? t("artifact.live_mini.body")}</p>
      </header>
      <div className={styles.miniAppControls}>
        <label>
          {t("artifact.live_mini.step_count")} {stepCount}
          <input
            type="range"
            min={4}
            max={12}
            value={stepCount}
            onChange={(event) => setStepCount(Number(event.target.value))}
          />
        </label>
        <button type="button" className={styles.generateButton} onClick={() => setGeneratedCount(stepCount)}>
          {t("artifact.live_mini.generate")} {stepCount} {t("artifact.live_mini.unit")}
        </button>
      </div>
      {generatedCount > 0 && (
        <ol className={styles.questionList} aria-label={t("artifact.live_mini.generated_label")}>
          {Array.from({ length: generatedCount }, (_, index) => (
            <li key={index}>{checks[index % checks.length]}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function MiniAppDemo({ artifactTitle, artifactSummary, artifactBadge }: { artifactTitle?: string; artifactSummary?: string; artifactBadge?: string } = {}) {
  if (artifactTitle || artifactSummary) {
    return <LiveArtifactMiniAppDemo artifactTitle={artifactTitle} artifactSummary={artifactSummary} artifactBadge={artifactBadge} />;
  }
  return <StudyMiniAppDemo />;
}

export function ArtifactWorkspace({ v1Content, v2Content }: { v1Content: string; v2Content: string }) {
  const timeline = [
    ["v1", t("artifact.workspace.v1")],
    ["attack_031", t("artifact.workspace.attack")],
    ["defense_041", t("artifact.workspace.defense")],
    ["patch_049", t("artifact.workspace.patch")],
    ["v2", t("artifact.workspace.v2")],
    ["test_052", t("artifact.workspace.test")],
  ] as const;
  return (
    <div className={styles.artifactWorkspace} data-testid="artifact-workspace">
      <aside className={styles.artifactTimeline}>
        <h3>{t("artifact.workspace.timeline")}</h3>
        <ol>{timeline.map(([id, label], index) => <li key={id} data-status={index === 1 ? "fail" : index >= 4 ? "pass" : "recorded"}><code>{id}</code><span>{label}</span></li>)}</ol>
      </aside>
      <section className={styles.workspacePreview}>
        <header><span>{t("artifact.workspace.preview")}</span><b>{t("artifact.workspace.interactive")}</b></header>
        <MiniAppDemo />
      </section>
      <aside className={styles.recoverySummary}>
        <h3>{t("artifact.workspace.recovery")}</h3>
        <p>{t("artifact.workspace.recovery_body")}</p>
        <dl>
          <div><dt>v1</dt><dd><code>{v1Content.split("\n")[0]}</code></dd></div>
          <div><dt>v2</dt><dd><code>{v2Content.split("\n")[1] ?? v2Content.split("\n")[0]}</code></dd></div>
        </dl>
        <div className={styles.recoveryBadges}><span>{t("artifact.workspace.patch_ready")}</span><span>{t("artifact.workspace.test_pass")}</span></div>
      </aside>
    </div>
  );
}

export type VersionCompareProps = {
  v1Content: string;
  v2Content: string;
  v1Label?: string;
  v2Label?: string;
};

export function VersionCompare({ v1Content, v2Content, v1Label, v2Label }: VersionCompareProps) {
  return (
    <div className={styles.versionCompare} data-testid="version-compare">
      <div className={styles.versionPane}>
        <h4>{v1Label ?? t("artifact.version.v1")}</h4>
        <pre>{v1Content}</pre>
      </div>
      <div className={styles.versionPane}>
        <h4>{v2Label ?? t("artifact.version.v2")}</h4>
        <pre>{v2Content}</pre>
      </div>
    </div>
  );
}

export type PatchDiffProps = {
  diffText: string;
};

export function PatchDiff({ diffText }: PatchDiffProps) {
  const lines = diffText.split("\n");
  return (
    <pre className={styles.patchDiff} data-testid="patch-diff">
      {lines.map((line, index) => {
        const kind = line.startsWith("+") ? "add" : line.startsWith("-") ? "del" : line.startsWith("@") ? "hunk" : "ctx";
        return (
          <div key={index} className={styles[`diff_${kind}`]} data-diff={kind}>
            {line}
          </div>
        );
      })}
    </pre>
  );
}

export type TestResultRow = {
  id: string;
  name: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
};

export function TestResultsTable({ rows }: { rows: readonly TestResultRow[] }) {
  return (
    <table className={styles.testTable} data-testid="test-results">
      <thead>
        <tr>
          <th>{t("artifact.test.id")}</th>
          <th>{t("artifact.test.name")}</th>
          <th>{t("artifact.test.input")}</th>
          <th>{t("artifact.test.expected")}</th>
          <th>{t("artifact.test.actual")}</th>
          <th>{t("artifact.test.result")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-passed={row.passed}>
            <td><code>{row.id}</code></td>
            <td>{row.name}</td>
            <td>{row.input}</td>
            <td>{row.expected}</td>
            <td>{row.actual}</td>
            <td>{row.passed ? `✅ ${t("artifact.test.pass")}` : `❌ ${t("artifact.test.fail")}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type EvidenceLink = {
  eventId: string;
  label: string;
};

export function EvidenceLinks({ links, onJump }: { links: readonly EvidenceLink[]; onJump?: (eventId: string) => void }) {
  return (
    <ol className={styles.evidenceLinks} data-testid="evidence-links">
      {links.map((link) => (
        <li key={link.eventId}>
          <button type="button" onClick={() => onJump?.(link.eventId)}>
            <code>{link.eventId}</code>
            <span>{link.label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function LiveDegradedCard({ onBackToVerified }: { onBackToVerified?: () => void }) {
  return (
    <div className={styles.degradedCard} data-testid="artifact-live-degraded">
      <h3>{t("artifact.degraded.title")}</h3>
      <p>{t("artifact.degraded.body")}</p>
      <button type="button" onClick={onBackToVerified} className={styles.degradedCta}>
        {t("artifact.degraded.cta")}
      </button>
    </div>
  );
}
