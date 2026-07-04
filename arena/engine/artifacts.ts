import {
  assertArtifact,
  type Artifact,
  type ArtifactType,
  type Battle,
  type BattleSettings,
  type CalculatedScore,
  type Proposal,
} from "../schemas";

export type ArtifactGeneratorInput = {
  battle: Battle;
  settings: BattleSettings;
  championProposal: Proposal;
  championScore: CalculatedScore;
  nextId?: (prefix: string) => string;
};

const getArtifactTypes = (settings: BattleSettings): ArtifactType[] =>
  Array.from(new Set<ArtifactType>(["product_brief", ...settings.outputTargets]));

const createArtifactContent = (
  type: ArtifactType,
  battle: Battle,
  proposal: Proposal,
  championScore: CalculatedScore,
): string => {
  switch (type) {
    case "product_brief":
      return `# ${proposal.productName}

${proposal.oneLiner}

## Battle Context
${battle.idea}

## Target User
${proposal.targetUser}

## Why This Direction Won
${proposal.whyThisCanWin}

## System Score
${championScore.totalScore.toFixed(2)} / 10`;
    case "prd":
      return `# PRD: ${proposal.productName}

## Problem
${proposal.problem}

## Solution
${proposal.solution}

## MVP Features
${proposal.mvpFeatures.map((feature) => `- ${feature}`).join("\n")}

## Risks
${proposal.risks.map((risk) => `- ${risk}`).join("\n")}`;
    case "architecture":
      return `# Architecture: ${proposal.productName}

## Principle
Battle Engine owns the rules. Agents generate content.

## Core Modules
- State machine for deterministic round order
- In-memory event store for MVP evidence
- Code-owned score calculator
- Replay generator from events
- Passport generator from normalized battle entities

## Technical Highlight
${proposal.technicalHighlight}`;
    case "demo_script":
      return `# Demo Script: ${proposal.productName}

1. Paste the messy agent-metaverse hackathon idea.
2. Reveal Safe Builder, Viral Designer, and Infra Hacker.
3. Compare the three proposals.
4. Show cross attacks and defenses.
5. Reveal the calculated scoreboard and champion.
6. Open replay and passport snapshots as proof.

## Champion Demo Plan
${proposal.demoPlan}`;
    case "pitch_outline":
      return `# Pitch Outline: ${proposal.productName}

## Hook
${proposal.oneLiner}

## Why Now
Agents are everywhere, but users still cannot tell which ones perform.

## Product
${proposal.solution}

## Proof
Every replay, artifact, and passport field is generated from battle data.`;
    case "todo":
      return `# TODO: ${proposal.productName}

- Build the battle setup form.
- Render seeded team cards and proposal comparison.
- Connect the UI to runDemoBattle().
- Add streaming once the persistent store exists.
- Replace mocked Eve fixtures through the adapter boundary.`;
  }
};

const getArtifactTitle = (type: ArtifactType, proposal: Proposal): string => {
  switch (type) {
    case "product_brief":
      return `${proposal.productName} Product Brief`;
    case "prd":
      return `${proposal.productName} PRD`;
    case "architecture":
      return `${proposal.productName} Architecture`;
    case "demo_script":
      return `${proposal.productName} Demo Script`;
    case "pitch_outline":
      return `${proposal.productName} Pitch Outline`;
    case "todo":
      return `${proposal.productName} TODO`;
  }
};

export function generateArtifactsForChampion(input: ArtifactGeneratorInput): Artifact[] {
  const artifactTypes = getArtifactTypes(input.settings);

  const artifacts = artifactTypes.map((type) => {
    const artifact: Artifact = {
      id: input.nextId?.("artifact") ?? `artifact_${input.battle.id}_${type}`,
      battleId: input.battle.id,
      type,
      title: getArtifactTitle(type, input.championProposal),
      content: createArtifactContent(type, input.battle, input.championProposal, input.championScore),
    };

    assertArtifact(artifact);
    return artifact;
  });

  return artifacts;
}

export function packageArtifactsAsMarkdown(artifacts: Artifact[]): string {
  return artifacts.map((artifact) => artifact.content.trim()).join("\n\n---\n\n");
}
