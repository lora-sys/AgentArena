import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * TypewriterText — 逐字呈现文本的打字机组件（Issue #30 / 计划 #09）
 *
 * 用途：Live Arena 里 Proposal / Attack / Defense 等文本逐字呈现。
 * 权威口径：`ui/Agent_Arena_v0.5.2_最终交付包.md` §138 —— 14–25ms/字符，前端模拟，
 * 不接真实 streaming。`prefers-reduced-motion` 时静态降级为整段文本。
 *
 * 供 B / C / D 三条线消费的稳定接口：
 * - `text`：要呈现的完整文本（已拿到全文，非流式）。
 * - `msPerChar`：每字符间隔，默认 22ms（落在 14–25ms 区间中段）。
 * - `startDelayMs`：开始前延迟，便于与 RoundBanner 转场错峰。
 * - `showCursor`：是否显示闪烁光标（打字中始终显示，打完由 `keepCursor` 决定）。
 * - `keepCursor`：打完后是否保留光标，默认 false。
 * - `active`：是否允许播放；false 时静态显示全文（用于非激活卡片）。
 * - `onDone`：打字完成回调（reduced-motion / 非 active 时也会触发一次）。
 * - `as`：渲染的标签，默认 `span`。
 */
export interface TypewriterTextProps {
  text: string;
  msPerChar?: number;
  startDelayMs?: number;
  showCursor?: boolean;
  keepCursor?: boolean;
  active?: boolean;
  onDone?: () => void;
  className?: string;
  as?: ElementType;
  "aria-label"?: string;
}

const DEFAULT_MS_PER_CHAR = 22; // 落在交付包规定的 14–25ms/字符 区间

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TypewriterText({
  text,
  msPerChar = DEFAULT_MS_PER_CHAR,
  startDelayMs = 0,
  showCursor = true,
  keepCursor = false,
  active = true,
  onDone,
  className,
  as,
  "aria-label": ariaLabel,
}: TypewriterTextProps): ReactNode {
  const Tag = (as ?? "span") as ElementType;
  const chars = Array.from(text); // 按码位切分，避免把 emoji / 组合字拆坏
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // 非激活或 reduced-motion：直接整段呈现并回调一次
    if (!active || prefersReducedMotion() || msPerChar <= 0) {
      setCount(chars.length);
      onDoneRef.current?.();
      return;
    }

    setCount(0);
    let index = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        index += 1;
        setCount(index);
        if (index >= chars.length) {
          if (intervalId) clearInterval(intervalId);
          onDoneRef.current?.();
        }
      }, msPerChar);
    }, startDelayMs);

    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
    // 依赖 text 变化即重启；chars.length 由 text 决定
  }, [text, msPerChar, startDelayMs, active]);

  const done = count >= chars.length;
  const visible = chars.slice(0, count).join("");
  const cursorVisible = showCursor && (!done || keepCursor);

  return (
    <Tag className={["typewriter", className].filter(Boolean).join(" ")} aria-label={ariaLabel ?? text}>
      {/* 屏幕阅读器读全文，视觉按进度呈现 */}
      <span aria-hidden="true">{visible}</span>
      {cursorVisible && <i aria-hidden="true" className="typewriter-cursor" />}
    </Tag>
  );
}
