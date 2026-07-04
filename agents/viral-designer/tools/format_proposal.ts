export type Proposal = {
  teamId: string;
  productName: string;
  oneLiner: string;
  targetUser: string;
  problem: string;
  solution: string;
  mvpFeatures: string[];
  demoPlan: string;
  technicalHighlight: string;
  risks: string[];
  whyThisCanWin: string;
};

export type FormatProposalInput = {
  teamId: string;
  rawProposal: unknown;
};

const fallbackProposal: Omit<Proposal, "teamId"> = {
  productName: "Agent Arena",
  oneLiner: "Three AI teams fight over a messy hackathon idea and leave replayable evidence.",
  targetUser: "Hackathon builders who need a memorable direction fast.",
  problem: "Generic AI workspaces do not create a judge-ready story or strong demo moment.",
  solution: "Turn idea generation into a visible battle with attacks, scores, a champion, and artifacts.",
  mvpFeatures: ["team entrances", "cross attack cards", "judge scoreboard", "champion reveal"],
  demoPlan: "Enter a messy idea, watch teams clash, reveal the winner, then export the battle artifacts.",
  technicalHighlight: "Battle events power replay, scoring, and agent passport snapshots.",
  risks: ["The hook can outpace implementation", "visual polish can distract from core flow"],
  whyThisCanWin: "It is easy to explain, fun to watch, and creates screenshots people remember.",
};

export function formatProposal(input: FormatProposalInput): Proposal {
  const raw = asRecord(input.rawProposal);

  return {
    teamId: input.teamId,
    productName: readString(raw, "productName", fallbackProposal.productName),
    oneLiner: readString(raw, "oneLiner", fallbackProposal.oneLiner),
    targetUser: readString(raw, "targetUser", fallbackProposal.targetUser),
    problem: readString(raw, "problem", fallbackProposal.problem),
    solution: readString(raw, "solution", fallbackProposal.solution),
    mvpFeatures: readStringArray(raw, "mvpFeatures", fallbackProposal.mvpFeatures),
    demoPlan: readString(raw, "demoPlan", fallbackProposal.demoPlan),
    technicalHighlight: readString(raw, "technicalHighlight", fallbackProposal.technicalHighlight),
    risks: readStringArray(raw, "risks", fallbackProposal.risks),
    whyThisCanWin: readString(raw, "whyThisCanWin", fallbackProposal.whyThisCanWin),
  };
}

export function missingProposalFields(proposal: Proposal): string[] {
  return Object.entries(proposal)
    .filter(([, value]) => value === "" || (Array.isArray(value) && value.length === 0))
    .map(([key]) => key);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function readString(source: Record<string, unknown>, key: string, fallback: string): string {
  const value = source[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function readStringArray(source: Record<string, unknown>, key: string, fallback: string[]): string[] {
  const value = source[key];
  if (!Array.isArray(value)) {
    return fallback;
  }

  const strings = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return strings.length > 0 ? strings.map((item) => item.trim()) : fallback;
}
