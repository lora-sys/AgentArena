"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, Pause, Play, Share2, X } from "lucide-react";

export function ReplayControls({ elapsed, duration }: { elapsed: string; duration: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(38);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("http://localhost:3000/battle/demo/replay");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const interval = window.setInterval(() => {
      setProgress((value) => (value >= 96 ? 12 : value + 2));
    }, 700);
    return () => window.clearInterval(interval);
  }, [playing]);

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      <div className="button-row replay-actions">
        <button className="primary-action button-reset" type="button" onClick={() => setPlaying(true)}>
          <Play size={16} fill="currentColor" />
          Play
        </button>
        <button className="ghost-button" type="button" onClick={() => setPlaying(false)}>
          <Pause size={16} />
          Pause
        </button>
        <span className="replay-clock">{elapsed} / {duration}</span>
        <span className="replay-progress" aria-label={`Replay progress ${progress}%`}>
          <i style={{ width: `${progress}%` }} />
        </span>
        <button className="ghost-button" type="button" onClick={() => setShareOpen(true)}>
          <Share2 size={16} />
          Share
        </button>
        <a href="/api/battles/demo/export" className="ghost-button">
          <Download size={16} />
          Export
        </a>
      </div>

      {shareOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShareOpen(false)}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="replay-share-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close replay share" onClick={() => setShareOpen(false)}>
              <X size={18} />
            </button>
            <h2 id="replay-share-title">Share replay</h2>
            <p>Copy this replay link for judges or teammates.</p>
            <div className="copy-box">
              <span>{shareUrl}</span>
              <button type="button" onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ReplayModeTabs() {
  const [mode, setMode] = useState("Story Mode");
  return (
    <div className="mode-tabs" role="tablist" aria-label="Replay mode">
      {["Story Mode", "Evidence Mode", "Share Mode"].map((item) => (
        <button key={item} className={mode === item ? "active" : ""} type="button" onClick={() => setMode(item)}>
          {item}
        </button>
      ))}
      <span className="mode-note">
        {mode === "Story Mode"
          ? "Narrated battle flow"
          : mode === "Evidence Mode"
            ? "Event log and judge acceptance"
            : "Replay link and export surfaces"}
      </span>
    </div>
  );
}
