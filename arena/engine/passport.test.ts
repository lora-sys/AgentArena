import { describe, expect, it } from "vitest";
import { generateAgentPassports, type PassportGeneratorInput } from "./passport";
import type {
  Attack,
  CalculatedScore,
  Defense,
  EveAgentDefinition,
  Proposal,
  Team,
} from "../schemas";
import { calculateTotalScore } from "./scoring";

const makeTeam = (id: string, overrides: Partial<Team> = {}): Team => ({
  id,
  battleId: "btl_TESTTEST",
  name: `Team ${id}`,
  strategy: "balanced",
  riskProfile: "safe",
  eveAgentDirectory: `/agents/${id}`,
  ...overrides,
});

const makeAgentDef = (teamId: string): EveAgentDefinition => ({
  id: `${teamId}_agent`,
  name: `Agent for ${teamId}`,
  role: "builder",
  teamId,
  directoryPath: `/agents/${teamId}`,
  instructionsPath: `/agents/${teamId}/instructions.md`,
  skills: ["planning"],
  tools: [],
});

const makeProposal = (teamId: string, overrides: Partial<Proposal> = {}): Proposal => ({
  teamId,
  productName: `Product ${teamId}`,
  oneLiner: "A great product",
  targetUser: "developers",
  problem: "Hard problem",
  solution: "Great solution",
  mvpFeatures: ["feature-a"],
  demoPlan: "Demo plan",
  technicalHighlight: "Tech highlight",
  risks: ["risk-a"],
  whyThisCanWin: "Wins because of quality",
  ...overrides,
});

const makeAttack = (id: string, targetTeamId: string, overrides: Partial<Attack> = {}): Attack => ({
  id,
  attackerTeamId: "team_b_v1",
  targetTeamId,
  attackType: "too_generic",
  claim: `Attack claim ${id}`,
  evidence: `Evidence ${id}`,
  severity: "medium",
  suggestedFix: `Fix ${id}`,
  ...overrides,
});

const makeDefense = (
  id: string,
  attackId: string,
  teamId: string,
  accepted: boolean,
): Defense => ({
  id,
  attackId,
  teamId,
  targetTeamId: "team_b_v1",
  responseToAttack: "We respond",
  acceptedAttack: accepted,
  revision: "Revised approach",
});

const makeScore = (teamId: string, overrides: Record<string, number> = {}): CalculatedScore => {
  const base = {
    novelty: 7,
    feasibility: 7,
    demoWow: 7,
    technicalDepth: 7,
    userValue: 7,
    longTermPotential: 7,
  };
  const scores = { ...base, ...overrides };
  return { teamId, scores, judgeComments: [], totalScore: calculateTotalScore({ teamId, scores, judgeComments: [] }) };
};

describe("generateAgentPassports", () => {
  it("generates one passport per team", () => {
    const teams = [makeTeam("team_a"), makeTeam("team_b")];
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams,
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.agentId)).toContain("team_a_agent");
    expect(result.map((p) => p.agentId)).toContain("team_b_agent");
  });

  it("uses team name as fallback when agent definition is missing", () => {
    const team = makeTeam("team_a", { name: "Fallback Name" });
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].agentName).toBe("Fallback Name");
    expect(result[0].role).toBe("balanced"); // falls back to team.strategy
    expect(result[0].directoryPath).toBe("/agents/team_a"); // falls back to team.eveAgentDirectory
  });

  it("uses agent definition fields when present", () => {
    const team = makeTeam("team_a");
    const agentDef = makeAgentDef("team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [agentDef],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].agentName).toBe(agentDef.name);
    expect(result[0].role).toBe(agentDef.role);
    expect(result[0].directoryPath).toBe(agentDef.directoryPath);
  });

  it("splits attacks into accepted and rejected claims based on defense", () => {
    const team = makeTeam("team_a");
    const attack = makeAttack("atk_1", "team_a");
    const defense = makeDefense("def_1", "atk_1", "team_a", true);
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [attack],
      defenses: [defense],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].acceptedClaims).toHaveLength(1);
    expect(result[0].rejectedClaims).toHaveLength(0);
  });

  it("ignores attacks without a matching defense", () => {
    const team = makeTeam("team_a");
    const attack = makeAttack("atk_1", "team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [attack],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].acceptedClaims).toHaveLength(0);
    expect(result[0].rejectedClaims).toHaveLength(0);
  });

  it("includes rejected claims when defense.acceptedAttack is false", () => {
    const team = makeTeam("team_a");
    const attack = makeAttack("atk_1", "team_a");
    const defense = makeDefense("def_1", "atk_1", "team_a", false);
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [attack],
      defenses: [defense],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].acceptedClaims).toHaveLength(0);
    expect(result[0].rejectedClaims).toHaveLength(1);
  });

  it("derives weaknesses from accepted attacks (attackType + suggestedFix)", () => {
    const team = makeTeam("team_a");
    const attack = makeAttack("atk_1", "team_a", { attackType: "weak_demo", suggestedFix: "Add live demo" });
    const defense = makeDefense("def_1", "atk_1", "team_a", true);
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [attack],
      defenses: [defense],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].weaknesses[0]).toContain("weak_demo");
    expect(result[0].weaknesses[0]).toContain("Add live demo");
  });

  it("falls back to lowest score category when no accepted attacks", () => {
    const team = makeTeam("team_a");
    const score = makeScore("team_a", { novelty: 2, feasibility: 9, demoWow: 9, technicalDepth: 9, userValue: 9, longTermPotential: 9 });
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [score],
    };
    const result = generateAgentPassports(input);
    expect(result[0].weaknesses[0]).toContain("novelty");
  });

  it("includes proposal.whyThisCanWin in strengths when proposal is available", () => {
    const team = makeTeam("team_a");
    const proposal = makeProposal("team_a", { whyThisCanWin: "Best demo ever" });
    const score = makeScore("team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [proposal],
      attacks: [],
      defenses: [],
      scores: [score],
    };
    const result = generateAgentPassports(input);
    expect(result[0].strengths[0]).toBe("Best demo ever");
  });

  it("limits weaknesses to at most 3 accepted attacks", () => {
    const team = makeTeam("team_a");
    const attacks: Attack[] = [];
    const defenses: Defense[] = [];
    for (let i = 1; i <= 5; i++) {
      attacks.push(makeAttack(`atk_${i}`, "team_a", { attackType: "too_generic" }));
      defenses.push(makeDefense(`def_${i}`, `atk_${i}`, "team_a", true));
    }
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks,
      defenses,
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].weaknesses).toHaveLength(3);
  });

  it("uses custom nextId when provided", () => {
    const team = makeTeam("team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
      nextId: (prefix) => `custom_${prefix}_1`,
    };
    const result = generateAgentPassports(input);
    expect(result[0].id).toBe("custom_passport_1");
  });

  it("uses default id format when nextId is not provided", () => {
    const team = makeTeam("team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].id).toBe("passport_btl_TESTTEST_team_a");
  });

  it("includes contributionSummary with score and productName when both proposal and score are available", () => {
    const team = makeTeam("team_a");
    const proposal = makeProposal("team_a", { productName: "WonderApp" });
    const score = makeScore("team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [proposal],
      attacks: [],
      defenses: [],
      scores: [score],
    };
    const result = generateAgentPassports(input);
    expect(result[0].contributionSummary).toContain("WonderApp");
    expect(result[0].contributionSummary).toContain(score.totalScore.toFixed(2));
  });

  it("includes fallback contributionSummary when no proposal or score is available", () => {
    const team = makeTeam("team_a", { name: "Lone Wolf" });
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].contributionSummary).toContain("Lone Wolf");
    expect(result[0].contributionSummary).toContain("participated");
  });

  it("uses contributionScore = 0 when no score is available", () => {
    const team = makeTeam("team_a");
    const input: PassportGeneratorInput = {
      battleId: "btl_TESTTEST",
      teams: [team],
      agentDefinitions: [],
      proposals: [],
      attacks: [],
      defenses: [],
      scores: [],
    };
    const result = generateAgentPassports(input);
    expect(result[0].contributionScore).toBe(0);
  });
});
