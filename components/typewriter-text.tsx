"use client";

import { useEffect, useState } from "react";
import styles from "./battle-replay-player.module.css";

export function TypewriterText({ text, runKey, speedMs = 16, active = true }: {
  text: string;
  runKey: string;
  speedMs?: number;
  active?: boolean;
}) {
  const [visibleLength, setVisibleLength] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleLength(text.length);
      return;
    }
    setVisibleLength(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleLength(Math.min(index, text.length));
      if (index >= text.length) window.clearInterval(timer);
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [active, runKey, speedMs, text]);

  const complete = visibleLength >= text.length;
  return (
    <span>
      {text.slice(0, visibleLength)}
      {!complete ? <span className={styles.cursor} aria-hidden="true" /> : null}
    </span>
  );
}
