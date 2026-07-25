import { t } from "../i18n/zh";
import styles from "./artifact-detail-tabs.module.css";

type DiffLine = { text: string; kind: "context" | "removed" | "added" | "blank" };

function splitDiff(diffText: string) {
  const before: DiffLine[] = [];
  const after: DiffLine[] = [];
  const metadata: string[] = [];
  for (const line of diffText.split("\n")) {
    if (line.startsWith("---") || line.startsWith("+++") || line.startsWith("@@")) {
      metadata.push(line);
    } else if (line.startsWith("-")) {
      before.push({ text: line.slice(1), kind: "removed" });
      after.push({ text: "", kind: "blank" });
    } else if (line.startsWith("+")) {
      before.push({ text: "", kind: "blank" });
      after.push({ text: line.slice(1), kind: "added" });
    } else {
      const text = line.startsWith(" ") ? line.slice(1) : line;
      before.push({ text, kind: "context" });
      after.push({ text, kind: "context" });
    }
  }
  return { before, after, metadata };
}

function DiffColumn({ label, lines }: { label: string; lines: DiffLine[] }) {
  return <article className={styles.diffColumn} aria-label={label}>
    <header>{label}</header>
    <pre>{lines.map((line, index) => <code key={`${index}-${line.kind}`} data-diff-kind={line.kind}>{line.text || " "}</code>)}</pre>
  </article>;
}

export function ArtifactTabPatch({ diffText }: { diffText: string }) {
  const diff = splitDiff(diffText);
  return <div className={styles.patch}>
    <div className={styles.diffMeta}>{diff.metadata.map((line) => <span key={line}>{line}</span>)}</div>
    <div className={styles.diffGrid}>
      <DiffColumn label={t("artifact.patch.before")} lines={diff.before} />
      <DiffColumn label={t("artifact.patch.after")} lines={diff.after} />
    </div>
  </div>;
}
