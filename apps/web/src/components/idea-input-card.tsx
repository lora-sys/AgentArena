import { useState, type FormEvent } from "react";
import { t } from "../i18n";
import styles from "./idea-input-card.module.css";

export type IdeaInputCardProps = {
  /** Template-selected initial brief. The card remains the only editable idea input on Home. */
  initialIdea?: string;
  /** called after successful POST /api/battles; falls back to verified_replay on error */
  onBattleCreated?: (battleId: string) => void;
  /** navigation injection for tests; defaults to window.location */
  navigateTo?: (url: string) => void;
};

const MAX_IDEA_LENGTH = 300;

function defaultNavigate(url: string): void {
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}

export function IdeaInputCard({ initialIdea = "", onBattleCreated, navigateTo = defaultNavigate }: IdeaInputCardProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = idea.trim();
  const tooLong = trimmed.length > MAX_IDEA_LENGTH;
  const canSubmit = trimmed.length > 0 && !tooLong && !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed }),
      });
      if (response.status === 501) {
        // Feature flag off → demo_fallback: show verified_replay but badge reads 演示兜底
        navigateTo(`/battle/BA-2026-0024?mode=demo_fallback`);
        return;
      }
      if (response.status === 429) {
        setError(t("error.rate_limited"));
        return;
      }
      if (!response.ok) {
        setError(t("error.generic"));
        return;
      }
      const body = await response.json() as { battleId?: string };
      if (!body.battleId) {
        setError(t("error.generic"));
        return;
      }
      try {
        window.sessionStorage.setItem(`agent-arena:idea:${body.battleId}`, trimmed);
      } catch {
        // Session storage is an optional presentation aid; SSE remains authoritative.
      }
      onBattleCreated?.(body.battleId);
      navigateTo(`/battle/${body.battleId}?mode=live_runtime`);
    } catch {
      setError(t("error.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit} data-testid="idea-input-card">
      <label htmlFor="idea-input" className={styles.label}>
        {t("landing.idea_input.label")}
      </label>
      <textarea
        id="idea-input"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder={t("landing.idea_input.placeholder")}
        rows={3}
        maxLength={MAX_IDEA_LENGTH * 2}
        className={styles.textarea}
        aria-invalid={tooLong}
        aria-describedby="idea-input-hint"
      />
      <div className={styles.footer}>
        <span id="idea-input-hint" className={styles.hint} data-error={tooLong || Boolean(error)}>
          {error ?? (tooLong ? t("landing.idea_input.too_long") : `${trimmed.length}/${MAX_IDEA_LENGTH}`)}
        </span>
        <button type="submit" disabled={!canSubmit} className={styles.submit}>
          {submitting ? `${t("common.loading")}…` : t("landing.idea_input.submit")}
        </button>
      </div>
    </form>
  );
}
