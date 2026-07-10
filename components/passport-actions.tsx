"use client";

import { Download, Printer, Share2 } from "lucide-react";

/**
 * PassportActions — client-only buttons for the passport page.
 *
 * Extracted from the server component because `onClick` handlers
 * can't be serialized through RSC. Renders Replay / Export / Print
 * / Share link actions.
 */
export function PassportActions({
  battleId,
  shareUrl,
}: {
  battleId: string;
  shareUrl: string;
}) {
  return (
    <div className="passport-actions">
      <a
        href={`/battle/${battleId}/replay`}
        className="inline-flex items-center gap-s-2 rounded-r-md bg-team-safe px-s-6 py-s-2 font-bold text-white"
      >
        View Replay
      </a>
      <a
        href={`/api/battles/${battleId}/export`}
        className="inline-flex items-center gap-s-2 rounded-r-md border border-border px-s-6 py-s-2 font-bold text-fg bg-bg-elev"
      >
        <Download size={16} /> Export .md
      </a>
      <button
        type="button"
        className="ghost-button no-print"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.print();
          }
        }}
      >
        <Printer size={16} /> Print
      </button>
      <button
        type="button"
        className="ghost-button no-print"
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).catch(() => {
              /* clipboard unavailable — no-op */
            });
          }
        }}
      >
        <Share2 size={16} /> Share Link
      </button>
    </div>
  );
}