import type { ArtifactBundle } from "@agent-arena/contracts";
import { MiniAppDemo } from "./mini-app-demo";
import { t } from "../i18n/zh";
import styles from "./artifact-tab-versions.module.css";

export function ArtifactTabVersions({ artifact }: { artifact: ArtifactBundle }) {
  return <div className={styles.layout}>
    <section className={styles.versions} aria-label={t("artifact.versions.compare_label")}>
      {artifact.versions.map((version) => <article key={version.version} className={styles.version} aria-label={version.label}>
        <header>
          <span>{version.label}</span>
          {version.version === artifact.currentVersion && <b>{t("artifact.version.current")}</b>}
        </header>
        <pre><code>{version.contentText}</code></pre>
        <footer>{t("artifact.version.evidence_prefix")} · {version.linkedEventId}</footer>
      </article>)}
    </section>
    <MiniAppDemo />
  </div>;
}
