import { useEffect, useRef, useState } from "react";

export type TypewriterTextProps = {
  text: string;
  /** ms per character, 14–25 recommended */
  speedMs?: number;
  onDone?: () => void;
  className?: string;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TypewriterText({ text, speedMs = 18, onDone, className }: TypewriterTextProps) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    if (prefersReducedMotion()) {
      setShown(text.length);
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    setShown(0);
    const timer = setInterval(() => {
      setShown((prev) => {
        if (prev >= text.length) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [text, speedMs, onDone]);

  return (
    <span className={className} data-testid="typewriter" data-done={shown >= text.length}>
      {text.slice(0, shown)}
      {shown < text.length && <span aria-hidden="true">▌</span>}
    </span>
  );
}
