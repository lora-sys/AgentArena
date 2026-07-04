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
  productName: "Agent Reputation Protocol",
  oneLiner: "A battle-tested evidence layer for proving what agents can actually do.",
  targetUser: "Agent developers who need credible evaluation and reputation data.",
  problem: "Agent claims are hard to trust without event-backed proof of performance.",
  solution: "Run agents through structured battles and convert their behavior into replayable reputation records.",
  mvpFeatures: ["event log", "score calculator", "passport snapshot", "markdown evidence package"],
  demoPlan: "Show a battle event stream, calculate scores in code, then generate a passport from the same evidence.",
  technicalHighlight: "A deterministic state machine creates replay and passport data from persisted battle events.",
  risks: ["Architecture may feel abstract", "protocol framing can exceed MVP scope"],
  whyThisCanWin: "It makes the demo feel like durable agent infrastructure instead of prompt theater.",
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
