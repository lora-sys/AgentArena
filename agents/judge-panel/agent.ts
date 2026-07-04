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

export const scoringDimensions = [
  "novelty",
  "feasibility",
  "demoWow",
  "technicalDepth",
  "userValue",
  "longTermPotential",
] as const;

export const judgePanelAgent: EveAgentDefinition = {
  id: "judge-panel",
  name: "Judge Panel",
  role: "Hackathon, market, and technical judging team",
  directoryPath: "agents/judge-panel",
  instructionsPath: "agents/judge-panel/instructions.md",
  skills: [
    "skills/hackathon-judge.md",
    "skills/market-judge.md",
    "skills/technical-judge.md",
    "skills/scoring-rubric.md",
  ],
  tools: ["tools/calculate_score.ts"],
};

export const judgePanelBattleProfile = {
  strategy: "Simulate hackathon judges, market judges, and technical judges.",
  perspectives: ["hackathon", "market", "technical"],
  optimizesFor: [
    "clear-product-difference",
    "demo-wow",
    "feasibility",
    "technical-credibility",
    "user-value",
    "long-term-potential",
  ],
  penalizes: [
    "generic-multi-agent-workspace",
    "pure-prompt-wrapper",
    "overbuilt-infra-with-weak-demo",
    "weak-user",
    "vague-long-term-vision",
    "no-screenshot-moment",
    "no-event-log-or-evidence-layer",
  ],
  supportedRounds: ["judging"],
  scoringDimensions,
} as const;

export default judgePanelAgent;
