import { useEffect, useRef, useState } from "react";
import type { Severity } from "@agent-arena/contracts";
import styles from "./hp-bar.module.css";

export type HpBarHit = {
  severity: Severity;
  damage: number;
  /** unique id per hit so the same damage re-triggers the animation */
  hitId: string;
};

export type HpBarProps = {
  hp: number;
  max?: number;
  teamColor: string;
  teamName: string;
  lastHit?: HpBarHit | null;
};

const LOW_HP_THRESHOLD = 35;

export function HpBar({ hp, max = 100, teamColor, teamName, lastHit }: HpBarProps) {
  const [flash, setFlash] = useState(Boolean(lastHit));
  const [shake, setShake] = useState(
    Boolean(lastHit && (lastHit.severity === "high" || lastHit.severity === "fatal")),
  );
  const [floatingDamage, setFloatingDamage] = useState<{ amount: number; key: string } | null>(
    lastHit ? { amount: lastHit.damage, key: lastHit.hitId } : null,
  );
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastHit) return;
    setFlash(true);
    setFloatingDamage({ amount: lastHit.damage, key: lastHit.hitId });
    if (lastHit.severity === "high" || lastHit.severity === "fatal") {
      setShake(true);
    }
    if (flashTimer.current) clearTimeout(flashTimer.current);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    if (floatTimer.current) clearTimeout(floatTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 500);
    shakeTimer.current = setTimeout(() => setShake(false), 450);
    floatTimer.current = setTimeout(() => setFloatingDamage(null), 1100);
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      if (floatTimer.current) clearTimeout(floatTimer.current);
    };
  }, [lastHit]);

  const percent = Math.max(0, Math.min(100, (hp / max) * 100));
  const isLow = hp < LOW_HP_THRESHOLD;
  const barColor = isLow ? "var(--danger)" : teamColor;

  return (
    <div
      className={`${styles.root} ${flash ? styles.flash : ""} ${shake ? styles.shake : ""}`}
      data-testid="hp-bar"
      data-low={isLow}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${teamName} 证明值 ${hp}/${max}`}
    >
      <div className={styles.header}>
        <span className={styles.teamName}>{teamName}</span>
        <span className={styles.hpText}>
          <strong className={styles.hpNumber} data-testid="hp-number">{hp}</strong>
          <span className={styles.hpMax}>/{max}</span>
        </span>
      </div>
      <div className={styles.track} role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={styles.fill}
          style={{
            width: `${percent}%`,
            background: barColor,
            boxShadow: `0 0 12px ${barColor}`,
          }}
        />
      </div>
      {floatingDamage && (
        <div
          key={floatingDamage.key}
          className={`${styles.floating} ${lastHit?.severity === "fatal" ? styles.floatingFatal : ""}`}
          data-testid="floating-damage"
        >
          -{floatingDamage.amount}
        </div>
      )}
    </div>
  );
}
