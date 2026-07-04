export type EveAgentDefinition = {
  id: string;
  name: string;
  role: string;
  teamId?: string;
  directoryPath: string;
  instructionsPath: string;
  skills: string[];
  tools: string[];
  model?: string;
};

export const expectedArtifactTypes = [
  "product_brief",
  "prd",
  "architecture",
  "demo_script",
  "pitch_outline",
  "todo",
] as const;

export const artifactWriterAgent: EveAgentDefinition = {
  id: "artifact-writer",
  name: "Artifact Writer",
  role: "Documentation agent that turns the champion proposal into builder-ready artifacts",
  directoryPath: "agents/artifact-writer",
  instructionsPath: "agents/artifact-writer/instructions.md",
  skills: [
    "skills/prd-writing.md",
    "skills/architecture-writing.md",
    "skills/demo-script-writing.md",
    "skills/pitch-writing.md",
  ],
  tools: ["tools/export_markdown.ts"],
};

export const artifactWriterBattleProfile = {
  strategy: "Convert the champion proposal into useful project artifacts.",
  inputs: [
    "original-idea",
    "battle-brief",
    "champion-proposal",
    "judge-comments",
    "attacks-and-defenses",
    "scoring-result",
  ],
  outputs: [
    "product-brief.md",
    "prd.md",
    "architecture.md",
    "demo-script.md",
    "pitch-outline.md",
    "todo.md",
  ],
  rules: [
    "do-not-invent-unsupported-features",
    "use-judge-comments",
    "keep-mvp-scope-realistic",
    "make-artifacts-builder-ready",
  ],
  supportedRounds: ["artifact_generation"],
  expectedArtifactTypes,
} as const;

export default artifactWriterAgent;
