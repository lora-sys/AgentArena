import { t } from "../i18n/zh";
import styles from "./artifact-modal.module.css";

export function AgentCardArtifactTrigger({ onOpen }: { onOpen: () => void }) {
  return <button type="button" className={styles.trigger} onClick={onOpen}>{t("artifact.trigger")}</button>;
}
