"use client";

import { useState } from "react";
import { demoBattle } from "@/lib/demo-data";

export function ArtifactViewer() {
  const [activeId, setActiveId] = useState(demoBattle.artifacts[0]?.id);
  const active = demoBattle.artifacts.find((artifact) => artifact.id === activeId) ?? demoBattle.artifacts[0];

  if (!active) {
    return <div className="artifact-viewer artifact-empty">No artifact selected</div>;
  }

  return (
    <div className="artifact-viewer">
      <div className="artifact-tabs" role="tablist" aria-label="Generated artifacts">
        {demoBattle.artifacts.map((artifact) => (
          <button
            key={artifact.id}
            className={artifact.id === active.id ? "active" : ""}
            type="button"
            onClick={() => setActiveId(artifact.id)}
          >
            {artifact.label}
          </button>
        ))}
      </div>
      <pre>{active.content}</pre>
      <div className="artifact-foot">Viewing: {active.title} (Markdown)</div>
    </div>
  );
}
