import { demoBattle, winner } from "./demo-data";

export function buildDemoExportMarkdown(battleId = demoBattle.id) {
  const artifactBody = demoBattle.artifacts
    .map((artifact) => `## ${artifact.title}\n\n${artifact.content}`)
    .join("\n\n---\n\n");

  return `# ${demoBattle.title}: Agent Arena Demo Export

Battle ID: ${battleId}

Winner: ${winner.name} (${winner.score.toFixed(1)}/100)

Idea:
${demoBattle.idea}

Why it won:
${winner.name} delivered the clearest combination of novelty, demo impact, and evidence-backed long-term potential.

## Event Log

${demoBattle.events.map((event) => `- ${event.time} [${event.type}] ${event.actor}: ${event.summary}`).join("\n")}

---

${artifactBody}
`;
}
