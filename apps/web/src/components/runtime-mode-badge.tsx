import { liveArenaZh as zh } from "../i18n/zh";

/**
 * RuntimeModeBadge — 运行时模式徽标（Issue #33 / 计划 #12）
 *
 * 三态：verified_replay（已验证演示）/ live_runtime（实时 AI 竞技）/ demo_fallback（演示兜底）。
 * 出现在 Landing + Live Arena + Fallback，帮助评委一眼分辨当前跑的是黄金剧情还是实时 AI。
 * 权威口径：docs/DEV-STANDARDS.md §0（页面 mode 划分）· §4（中文优先）。
 *
 * 中文主标题 + 英文副标题（技术副标题，符合中文优先规则）。
 */
export type RuntimeMode = "verified_replay" | "live_runtime" | "demo_fallback";

const VALID_MODES: readonly RuntimeMode[] = ["verified_replay", "live_runtime", "demo_fallback"];

/** 数据源 → 运行时模式：fixture=已验证演示 · event-store=实时 · fallback=兜底 */
export function modeFromSource(source: string | undefined): RuntimeMode {
  if (source === "event-store") return "live_runtime";
  if (source === "fallback") return "demo_fallback";
  return "verified_replay";
}

/** 归一化任意字符串到合法模式，非法回落 verified_replay */
export function normalizeMode(value: string | null | undefined): RuntimeMode {
  return VALID_MODES.includes(value as RuntimeMode) ? (value as RuntimeMode) : "verified_replay";
}

export interface RuntimeModeBadgeProps {
  mode: RuntimeMode;
  className?: string;
}

export function RuntimeModeBadge({ mode, className }: RuntimeModeBadgeProps) {
  const copy = zh.runtimeMode[mode] ?? zh.runtimeMode.verified_replay;
  return (
    <span
      className={["runtime-badge", `mode-${mode}`, className].filter(Boolean).join(" ")}
      data-mode={mode}
      aria-label={copy.label}
    >
      <i className="runtime-badge-dot" aria-hidden="true" />
      <b>{copy.label}</b>
      <small aria-hidden="true">{copy.sub}</small>
    </span>
  );
}
