import { useEffect, useRef, useState, type ReactNode } from "react";
import { zh } from "../i18n/zh";

/**
 * FatalTakeover — 致命攻击全屏接管态（Issue #34 / 计划 #13 · 设计稿画面 03）
 *
 * 权威口径：`ui/Agent_Arena_v0.5.2_最终交付包.md` §141 —— A 线负责视觉：
 *   红色警示条 + 攻击方/目标双面板 + 证明值骤降大字过渡（如 88 → -50 → 38）。
 *   Evidence Lens 自动展开的**内容**由 C 线（#39）负责；A 线只暴露触发点（onViewEvidence）+ children slot。
 *
 * 纯展示组件：所有数据由 props 显式注入，零数据耦合。
 * 真实接线（等 #23 fixture + #28 fatal severity）：
 *   HpBar onFatal → BattleWorkspace 从致命事件取 {attacker,target,hpBefore,damage,hpAfter} → <FatalTakeover open>。
 *
 * 动画时长走 tokens.css：大数字过渡随 --motion-hp-drain(700ms)；目标面板致命震动 --motion-fatal-shake(450ms)。
 * `prefers-reduced-motion` 下大数字直接落终值、面板不震动。
 */
export interface FatalTakeoverProps {
  open: boolean;
  /** 攻击方队名 */
  attacker: string;
  /** 目标队名 */
  target: string;
  /** 致命攻击事件标题，如 attack_031 */
  attackTitle: string;
  /** 致命载荷摘要（一句话） */
  attackSummary?: string;
  /** 证明值·改前（如 88） */
  hpBefore: number;
  /** 掉血量（如 50） */
  damage: number;
  /** 证明值·改后（如 38） */
  hpAfter: number;
  /** 关闭接管态 */
  onDismiss: () => void;
  /** 触发 Evidence Lens 展开（内容由 C 线负责） */
  onViewEvidence?: () => void;
  /** Evidence Lens 内容 slot（C 线 #39 注入） */
  children?: ReactNode;
}

/** 读取 prefers-reduced-motion（SSR 安全） */
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function hpDrainDuration(): number {
  if (typeof document === "undefined") return 700;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--motion-hp-drain").trim();
  if (raw.endsWith("ms")) return Number.parseFloat(raw);
  if (raw.endsWith("s")) return Number.parseFloat(raw) * 1000;
  return 700;
}

/** 大数字从 from 递减到 to，时长 durationMs；reduced-motion 直接落终值 */
function useCountDown(from: number, to: number, active: boolean, durationMs: number): number {
  const [value, setValue] = useState(from);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion() || durationMs <= 1) {
      setValue(to);
      return;
    }
    setValue(from);
    startRef.current = null;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [from, to, active, durationMs]);
  return value;
}

export function FatalTakeover({
  open,
  attacker,
  target,
  attackTitle,
  attackSummary,
  hpBefore,
  damage,
  hpAfter,
  onDismiss,
  onViewEvidence,
  children,
}: FatalTakeoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef<HTMLButtonElement>(null);
  // 从 token 读取掉血时长，reduced-motion 覆盖也会自动生效。
  const current = useCountDown(hpBefore, hpAfter, open, hpDrainDuration());

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dismissRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fatal-takeover"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="fatal-critical-title"
      onMouseDown={(e) => { if (e.currentTarget === e.target) onDismiss(); }}
    >
      <div ref={panelRef} className="fatal-panel">
        {/* 红色警示条 */}
        <header className="fatal-banner">
          <span className="fatal-banner-icon" aria-hidden="true">⚠</span>
          <b id="fatal-critical-title">{zh.fatal.critical}</b>
          <small>{zh.fatal.criticalEn}</small>
          <button ref={dismissRef} type="button" className="fatal-dismiss" onClick={onDismiss} aria-label={zh.fatal.dismiss}>✕</button>
        </header>

        {/* 攻击方 vs 目标 双面板 */}
        <div className="fatal-duel">
          <section className="fatal-side attacker">
            <span className="fatal-side-label">{zh.fatal.attacker}</span>
            <strong>{attacker}</strong>
            <div className="fatal-attack-event">
              <span>{zh.fatal.attackEvent}</span>
              <b>{attackTitle}</b>
              {attackSummary && <p>{attackSummary}</p>}
            </div>
          </section>

          {/* 证明值骤降大字过渡：88 → -50 → 38 */}
          <section className="fatal-proof" aria-label={`${zh.arena.hp} ${hpBefore} 掉 ${damage} 至 ${hpAfter}`}>
            <div className="fatal-proof-cell before">
              <b>{hpBefore}</b><i>/100</i>
              <span>{zh.fatal.before}</span>
            </div>
            <div className="fatal-proof-arrow" aria-hidden="true">→</div>
            <div className="fatal-proof-cell damage">
              <b>-{damage}</b>
              <span>{zh.fatal.proofDamage}</span>
            </div>
            <div className="fatal-proof-arrow" aria-hidden="true">→</div>
            <div className="fatal-proof-cell after">
              <b>{current}</b><i>/100</i>
              <span>{zh.fatal.after}</span>
            </div>
          </section>

          <section className="fatal-side target">
            <span className="fatal-side-label">{zh.fatal.target}</span>
            <strong>{target}</strong>
            {onViewEvidence && (
              <button type="button" className="fatal-view-evidence" onClick={onViewEvidence}>
                {zh.fatal.viewEvidence}
              </button>
            )}
          </section>
        </div>

        {/* Evidence Lens 内容 slot —— C 线 #39 注入 */}
        {children && <div className="fatal-evidence-slot">{children}</div>}
      </div>
    </div>
  );
}
