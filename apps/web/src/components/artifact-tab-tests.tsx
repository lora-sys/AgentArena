import type { TestResultPayload } from "@agent-arena/contracts";
import { t, type ZhKey } from "../i18n/zh";
import styles from "./artifact-detail-tabs.module.css";

const testCopy = {
  test_022: ["artifact.test.022.input", "artifact.test.expected.share_card", "artifact.test.022.actual"],
  test_032: ["artifact.test.032.input", "artifact.test.expected.share_card", "artifact.test.032.actual"],
  test_052: ["artifact.test.052.input", "artifact.test.052.expected", "artifact.test.052.actual"],
} as const;

export function ArtifactTabTests({ results }: { results: TestResultPayload[] }) {
  const columns: ZhKey[] = ["artifact.test.id", "artifact.test.name", "artifact.test.input", "artifact.test.expected", "artifact.test.actual", "artifact.test.result"];
  return <div className={styles.tableWrap}>
    <table className={styles.tests} aria-label={t("artifact.tests.table_label")}>
      <thead><tr>{columns.map((key) => <th key={key}>{t(key)}</th>)}</tr></thead>
      <tbody>{results.map((result) => {
        const copy = testCopy[result.id as keyof typeof testCopy];
        return <tr key={result.id}>
          <td><code>{result.id}</code></td><td>{result.name}</td>
          <td>{copy ? t(copy[0]) : t("artifact.test.unknown")}</td>
          <td>{copy ? t(copy[1]) : t("artifact.test.unknown")}</td>
          <td>{copy ? t(copy[2]) : t("artifact.test.unknown")}</td>
          <td><span className={result.passed ? styles.pass : styles.fail} aria-label={result.passed ? t("artifact.test.pass") : t("artifact.test.fail")}>{result.passed ? "✓" : "×"}</span></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
