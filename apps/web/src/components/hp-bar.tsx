import { useEffect, useRef, useState } from "react";
import type { Severity } from "@agent-arena/contracts";
import { liveArenaZh as zh } from "../i18n/zh";

/**
 * HpBar — Proof HP 血条 + 掉血 / 命中 / 致命动画（Issue #29 / 计划 #08）
 *
 * 权威口径：`ui/Agent_Arena_v0.5.2_最终交付包.md` §142 + DEV-STANDARDS §3.4（动画时长精确匹配）。
 * 动画一律走 tokens.css：
 *   掉血 700ms（--motion-hp-drain）· 闪红 500ms（--motion-hit-flash）·
 *   致命震动 450ms（--motion-fatal-shake）· 浮动伤害 1100ms（--motion-damage-float）。
 * HP < 35（--hp-danger-threshold）切危险色。`prefers-reduced-motion` 下全部静态呈现。
 *
 * ⚠️ 前向兼容 severity：契约 P2 #28 尚未落地 `fatal`（现 Severity = low|medium|high，DAMAGE_MAP 无 fatal）。
 * 本组件用本地 `HpSeverity = Severity | "fatal"` 与本地 DAMAGE_BY_SEVERITY（含 fatal=50）。
 * #28 合并后：删除本地表，改为 `import { DAMAGE_MAP } from "@agent-arena/contracts"`，接口零改动。
 */

/** 本地前向兼容 severity（等 P2 #28 契约补 fatal 后回收） */
export type HpSeverity = Severity | "fatal";

/** 本地伤害表（含 fatal=50）——与交付包 §7 数值一致；#28 落地后改用契约 DAMAGE_MAP */
const DAMAGE_BY_SEVERITY: Record<HpSeverity, number> = {
  low: 5,
  medium: 15,
  high: 30,
  fatal: 50,
};

export interface HpBarProps {
  /** 队伍 id（用于 aria + 主题色由父级 .fighter.<color> 提供） */
  teamId: string;
  /** 当前 HP（0..100） */
  hp: number;
  /** 上一帧 HP（用于计算掉血量与触发动画）；首帧可省略 */
  prevHp?: number;
  /** 本次命中的攻击严重度；有值且 hp 下降时播放闪红 / 浮伤 / 致命震动 */
  severity?: HpSeverity;
  /** 致命命中（severity==="fatal" 或 hp 归零）时触发一次，供 #34 接管 Evidence Lens */
  onFatal?: () => void;
  className?: string;
}

const DANGER_THRESHOLD = 35;

export function isFatalHpHit(previousHp: number | undefined, currentHp: number, severity?: HpSeverity): boolean {
  const tookDamage = previousHp !== undefined && currentHp < previousHp;
  return tookDamage && (severity === "fatal" || currentHp <= 0);
}

export function HpBar({ teamId, hp, prevHp, severity, onFatal, className = "" }: HpBarProps) {
  const clampedHp = Math.max(0, Math.min(100, hp));
  const damage = prevHp !== undefined ? Math.max(0, prevHp - clampedHp) : 0;
  const took = damage > 0;
  const isFatal = isFatalHpHit(prevHp, clampedHp, severity);
  const danger = clampedHp < DANGER_THRESHOLD;

  // 每次掉血生成一个 hit key，驱动闪红 / 浮伤 / 震动重播（React 用 key 重挂）
  const [hitKey, setHitKey] = useState(0);
  const [floatDamage, setFloatDamage] = useState(0);
  const firedFatalRef = useRef(false);

  useEffect(() => {
    if (took) {
      setHitKey((k) => k + 1);
      setFloatDamage(severity ? DAMAGE_BY_SEVERITY[severity] : damage);
    }
  }, [clampedHp, prevHp, took, severity, damage]);

  useEffect(() => {
    if (isFatal && !firedFatalRef.current) {
      firedFatalRef.current = true;
      onFatal?.();
    }
    if (!isFatal) firedFatalRef.current = false;
  }, [isFatal, onFatal]);

  return (
    <div
      className={`hp-bar ${danger ? "danger" : ""} ${isFatal ? "fatal" : took ? "hit" : ""} ${className}`}
      data-team-id={teamId}
    >
      {took && (
        <b className="hp-damage-pop" key={hitKey} aria-hidden="true">
          -{floatDamage}
        </b>
      )}
      <div className="hp-label">
        <span>{zh.arena.hp}</span>
        <b>
          {clampedHp}/100
        </b>
      </div>
      <div
        className="hp-track"
        role="progressbar"
        aria-label={`${zh.arena.hp} ${clampedHp}/100`}
        aria-valuenow={clampedHp}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i style={{ width: `${clampedHp}%` }} />
        {took && <span className="hp-flash" key={`flash-${hitKey}`} aria-hidden="true" />}
      </div>
    </div>
  );
}
