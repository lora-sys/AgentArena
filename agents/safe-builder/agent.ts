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

export const safeBuilderAgent: EveAgentDefinition = {
  id: "safe-builder",
  name: "Safe Builder",
  role: "Feasible hackathon product direction team",
  teamId: "safe-builder",
  directoryPath: "agents/safe-builder",
  instructionsPath: "agents/safe-builder/instructions.md",
  skills: [
    "skills/mvp-scoping.md",
    "skills/feasibility-check.md",
    "skills/demo-stability.md",
  ],
  tools: ["tools/format_proposal.ts"],
};

export const safeBuilderBattleProfile = {
  strategy: "Make the safest, most feasible, most buildable hackathon project.",
  riskProfile: "safe",
  optimizesFor: [
    "feasibility",
    "scope-control",
    "development-speed",
    "stable-demo-path",
    "clear-mvp",
    "low-implementation-risk",
  ],
  avoids: [
    "huge-platform-ideas",
    "vague-future-visions",
    "unverifiable-technical-claims",
    "too-many-agents",
    "too-many-tools",
    "undemoable-features",
  ],
  supportedRounds: ["proposal", "cross_attack", "defense"],
  expectedProposalFields,
} as const;

export default safeBuilderAgent;
