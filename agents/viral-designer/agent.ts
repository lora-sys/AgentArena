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

export const expectedProposalFields = [
  "productName",
  "oneLiner",
  "targetUser",
  "problem",
  "solution",
  "mvpFeatures",
  "demoPlan",
  "technicalHighlight",
  "risks",
  "whyThisCanWin",
] as const;

export const viralDesignerAgent: EveAgentDefinition = {
  id: "viral-designer",
  name: "Viral Designer",
  role: "Memorable and screenshot-worthy hackathon product team",
  teamId: "viral-designer",
  directoryPath: "agents/viral-designer",
  instructionsPath: "agents/viral-designer/instructions.md",
  skills: [
    "skills/novelty-detection.md",
    "skills/viral-hook.md",
    "skills/story-framing.md",
    "skills/share-loop.md",
  ],
  tools: ["tools/format_proposal.ts"],
};

export const viralDesignerBattleProfile = {
  strategy: "Make the most memorable, screenshot-worthy, story-driven hackathon project.",
  riskProfile: "aggressive",
  optimizesFor: [
    "novelty",
    "demo-wow",
    "shareability",
    "strong-product-metaphor",
    "judge-memory",
    "social-screenshots",
    "before-after-transformation",
  ],
  avoids: [
    "generic-multi-agent-workspaces",
    "boring-dashboards",
    "feature-lists-without-a-moment",
    "document-only-ai-tools",
    "products-with-no-story",
  ],
  supportedRounds: ["proposal", "cross_attack", "defense"],
  expectedProposalFields,
} as const;

export default viralDesignerAgent;
