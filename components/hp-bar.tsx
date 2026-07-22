"use client";

import type { Severity } from "@/arena/schemas/types";
import styles from "./battle-replay-player.module.css";

export type HitState = {
  severity: Severity;
  damage: number;
  hitId: string;
};

export function HpBar({ hp, teamColor, justHit }: { hp: number; teamColor: string; justHit?: HitState }) {
  const safeHp = Math.max(0, Math.min(100, hp));
  return (
    <div className={styles.hp} aria-label={`${safeHp} health points`}>
      <div className={styles.hpLabels}>
        <span>HP</span>
        <strong>{safeHp}</strong>
      </div>
      <div className={styles.hpTrack}>
        <span
          className={styles.hpFill}
          style={{ width: `${safeHp}%`, backgroundColor: safeHp <= 35 ? "var(--arena-danger)" : teamColor }}
        />
        {justHit ? (
          <span key={justHit.hitId} className={styles.damageFloat} aria-label={`${justHit.damage} damage`}>
            -{justHit.damage}
          </span>
        ) : null}
      </div>
    </div>
  );
}
