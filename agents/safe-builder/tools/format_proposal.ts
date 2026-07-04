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
  productName: "Scoped Hackathon MVP",
  oneLiner: "A focused 48-hour product direction with a reliable demo path.",
  targetUser: "Hackathon builders with a messy product idea.",
  problem: "The team needs a demoable plan without overbuilding.",
  solution: "Reduce the idea to one clear loop, one visible output, and one fallback replay.",
  mvpFeatures: ["Battle brief", "proposal comparison", "judge scoreboard", "markdown export"],
  demoPlan: "Run a seeded idea, generate one live proposal round, then show the fallback replay.",
  technicalHighlight: "Deterministic battle flow with schema-shaped agent output.",
  risks: ["Scope creep", "fragile live model output"],
  whyThisCanWin: "It is clear, buildable, and resilient under demo pressure.",
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
