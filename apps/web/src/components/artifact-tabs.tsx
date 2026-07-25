import { useState } from "react";
import { t } from "../i18n";
import styles from "./artifact-tabs.module.css";

export type MiniAppDemoState = {
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  generated: string[];
};

const DIFFICULTY_LABEL: Record<MiniAppDemoState["difficulty"], string> = {
  easy: "简单",
  medium: "中等",
  hard: "难",
};

const SAMPLE_QUESTIONS: Record<MiniAppDemoState["difficulty"], string[]> = {
  easy: ["1 + 1 = ?", "中国的首都是？", "水的化学式？"],
  medium: ["导数 d/dx (x²) = ?", "HTTP 与 HTTPS 区别？", "快速排序平均复杂度？"],
  hard: ["证明根号 2 是无理数", "分布式 CAP 定理含义？", "推导贝叶斯公式"],
};

export function MiniAppDemo() {
  const [state, setState] = useState<MiniAppDemoState>({
    difficulty: "medium",
    questionCount: 10,
    generated: [],
  });

  const handleGenerate = () => {
    const pool = SAMPLE_QUESTIONS[state.difficulty];
    const count = Math.min(state.questionCount, pool.length * 3);
    const generated = Array.from({ length: count }, (_, i) => pool[i % pool.length]);
    setState((prev) => ({ ...prev, generated }));
  };

  return (
    <div className={styles.miniApp} data-testid="mini-app-demo">
      <div className={styles.miniAppControls}>
        <label>
          难度
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
          题目数量 {state.questionCount}
          <input
            type="range"
            min={5}
            max={20}
            value={state.questionCount}
            onChange={(e) => setState((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
          />
        </label>
        <button type="button" onClick={handleGenerate} className={styles.generateButton}>
          生成 {state.questionCount} 道题目
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
