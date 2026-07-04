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

export const infraHackerAgent: EveAgentDefinition = {
  id: "infra-hacker",
  name: "Infra Hacker",
  role: "Technically credible and future-facing agent infrastructure team",
  teamId: "infra-hacker",
  directoryPath: "agents/infra-hacker",
  instructionsPath: "agents/infra-hacker/instructions.md",
  skills: [
    "skills/protocol-design.md",
    "skills/runtime-design.md",
    "skills/evidence-chain.md",
    "skills/future-architecture.md",
  ],
  tools: ["tools/format_proposal.ts"],
};

export const infraHackerBattleProfile = {
  strategy: "Make the most technically deep and future-facing hackathon project.",
  riskProfile: "balanced",
  optimizesFor: [
    "agent-runtime-credibility",
    "evidence-logging",
    "protocol-readiness",
    "reputation-data-model",
    "local-cloud-hybrid-path",
    "tool-and-sandbox-extensibility",
    "long-term-network-potential",
  ],
  avoids: [
    "pure-prompt-wrappers",
    "products-without-event-logs",
    "products-without-data-models",
    "products-with-no-external-agent-path",
    "unimplementable-architecture",
  ],
  supportedRounds: ["proposal", "cross_attack", "defense"],
  expectedProposalFields,
} as const;

export default infraHackerAgent;
