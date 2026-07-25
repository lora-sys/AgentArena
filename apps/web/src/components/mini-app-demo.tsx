import { useState } from "react";
import { t } from "../i18n/zh";
import styles from "./mini-app-demo.module.css";

type Difficulty = "easy" | "medium" | "hard";

const difficultyKeys: Record<Difficulty, "artifact.mini.difficulty.easy" | "artifact.mini.difficulty.medium" | "artifact.mini.difficulty.hard"> = {
  easy: "artifact.mini.difficulty.easy",
  medium: "artifact.mini.difficulty.medium",
  hard: "artifact.mini.difficulty.hard",
};

const questionKeys = ["artifact.mini.question.1", "artifact.mini.question.2", "artifact.mini.question.3"] as const;

export function MiniAppDemo() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [generated, setGenerated] = useState({ difficulty: "medium" as Difficulty, count: 10 });

  return <section className={styles.shell} aria-label={t("artifact.mini.title")}>
    <header><span>{t("artifact.mini.badge")}</span><strong>{t("artifact.mini.title")}</strong><small>{t("artifact.mini.subtitle")}</small></header>
    <div className={styles.controls}>
      <label>{t("artifact.mini.difficulty.label")}
        <select aria-label={t("artifact.mini.difficulty.label")} value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          {(Object.keys(difficultyKeys) as Difficulty[]).map((value) => <option key={value} value={value}>{t(difficultyKeys[value])}</option>)}
        </select>
      </label>
      <label>{t("artifact.mini.count.label")}<output>{questionCount}</output>
        <input aria-label={t("artifact.mini.count.label")} type="range" min="5" max="20" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} />
      </label>
      <button type="button" onClick={() => setGenerated({ difficulty, count: questionCount })}>{t("artifact.mini.generate")}</button>
    </div>
    <div className={styles.result} aria-live="polite">
      <div><span>{t("artifact.mini.difficulty.result_prefix")}：{t(difficultyKeys[generated.difficulty])}</span><b>{t("artifact.mini.generated_prefix")} {generated.count} {t("artifact.mini.generated_suffix")}</b></div>
      <ul>{questionKeys.map((key, index) => <li key={key}><i>{index + 1}</i><span>{t(key)}</span></li>)}</ul>
    </div>
    <footer>{t("artifact.mini.local_only")}</footer>
  </section>;
}
