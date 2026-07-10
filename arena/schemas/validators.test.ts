import { describe, expect, it } from "vitest";
import {
  assertAgentPassport,
  assertArtifact,
  assertAttack,
  assertBattle,
  assertBattleBrief,
  assertBattleEvent,
  assertDefense,
  assertProposal,
  assertScore,
  assertTeam,
  SchemaValidationError,
} from "./validators";
import type {
  AgentPassport,
  Artifact,
  Attack,
  Battle,
  BattleBrief,
  BattleEvent,
  Defense,
  Proposal,
  Score,
  Team,
} from "./types";

/* ------------------------------------------------------------------ */
/* SchemaValidationError                                              */
/* ------------------------------------------------------------------ */

describe("SchemaValidationError", () => {
  it("stores the issues array", () => {
    const err = new SchemaValidationError("Test", ["field a is bad", "field b is bad"]);
    expect(err.issues).toEqual(["field a is bad", "field b is bad"]);
    expect(err.message).toBe("Test validation failed: field a is bad; field b is bad");
    expect(err.name).toBe("SchemaValidationError");
  });

  it("is an instance of Error", () => {
    const err = new SchemaValidationError("X", []);
    expect(err).toBeInstanceOf(Error);
  });
});

/* ------------------------------------------------------------------ */
/* assertBattleBrief                                                  */
/* ------------------------------------------------------------------ */

const validBattleBrief: BattleBrief = {
  goal: "Ship a hackathon project",
  constraints: ["time"],
  targetUser: "developers",
  successCriteria: ["demo works"],
  requiredArtifacts: ["product_brief"],
};

describe("assertBattleBrief", () => {
  it("passes on a valid brief", () => {
    expect(() => assertBattleBrief(validBattleBrief)).not.toThrow();
  });

  it("rejects a non-object value", () => {
    expect(() => assertBattleBrief("not a brief")).toThrow(SchemaValidationError);
  });

  it("rejects null", () => {
    expect(() => assertBattleBrief(null)).toThrow(SchemaValidationError);
  });

  it("rejects an array", () => {
    expect(() => assertBattleBrief([])).toThrow(SchemaValidationError);
  });

  it("reports multiple missing string fields", () => {
    expect(() => assertBattleBrief({})).toThrow(SchemaValidationError);
  });

  it("rejects empty strings", () => {
    expect(() => assertBattleBrief({ ...validBattleBrief, goal: "   " })).toThrow(SchemaValidationError);
  });

  it("rejects non-string arrays for string-array fields", () => {
    expect(() => assertBattleBrief({ ...validBattleBrief, constraints: [1, 2] })).toThrow(SchemaValidationError);
  });

  it("rejects when constraints is not an array", () => {
    expect(() => assertBattleBrief({ ...validBattleBrief, constraints: "string" })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertBattle                                                       */
/* ------------------------------------------------------------------ */

const validBattle: Battle = {
  id: "btl_TESTTEST",
  title: "Test Battle",
  idea: "An idea",
  type: "hackathon",
  status: "idle",
  constraints: {
    timeLimit: "48h",
    outputTargets: ["product_brief"],
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("assertBattle", () => {
  it("passes on a valid battle", () => {
    expect(() => assertBattle(validBattle)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertBattle(42)).toThrow(SchemaValidationError);
  });

  it("rejects invalid battle type", () => {
    expect(() => assertBattle({ ...validBattle, type: "unknown_type" })).toThrow(SchemaValidationError);
  });

  it("rejects invalid battle status", () => {
    expect(() => assertBattle({ ...validBattle, status: "bogus" })).toThrow(SchemaValidationError);
  });

  it("rejects non-object constraints", () => {
    expect(() => assertBattle({ ...validBattle, constraints: "not an object" })).toThrow(SchemaValidationError);
  });

  it("accepts an optional winnerTeamId", () => {
    expect(() => assertBattle({ ...validBattle, winnerTeamId: "team_a" })).not.toThrow();
  });

  it("rejects a non-string winnerTeamId", () => {
    expect(() => assertBattle({ ...validBattle, winnerTeamId: 42 })).toThrow(SchemaValidationError);
  });

  it("accepts an optional preference in constraints", () => {
    expect(() => assertBattle({ ...validBattle, constraints: { ...validBattle.constraints, preference: "balanced" } })).not.toThrow();
  });

  it("rejects a non-string preference", () => {
    expect(() => assertBattle({ ...validBattle, constraints: { ...validBattle.constraints, preference: 99 } })).toThrow(SchemaValidationError);
  });

  it("rejects empty title", () => {
    expect(() => assertBattle({ ...validBattle, title: "" })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertTeam                                                         */
/* ------------------------------------------------------------------ */

const validTeam: Team = {
  id: "team_a_v1",
  battleId: "btl_TESTTEST",
  name: "Safe Builder",
  strategy: "minimal",
  riskProfile: "safe",
  eveAgentDirectory: "/agents/safe-builder",
};

describe("assertTeam", () => {
  it("passes on a valid team", () => {
    expect(() => assertTeam(validTeam)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertTeam(null)).toThrow(SchemaValidationError);
  });

  it("rejects invalid risk profile", () => {
    expect(() => assertTeam({ ...validTeam, riskProfile: "extreme" })).toThrow(SchemaValidationError);
  });

  it("accepts a valid score", () => {
    expect(() => assertTeam({ ...validTeam, score: 8 })).not.toThrow();
  });

  it("rejects an out-of-range score", () => {
    expect(() => assertTeam({ ...validTeam, score: 11 })).toThrow(SchemaValidationError);
    expect(() => assertTeam({ ...validTeam, score: -1 })).toThrow(SchemaValidationError);
  });

  it("rejects a non-numeric score", () => {
    expect(() => assertTeam({ ...validTeam, score: "high" })).toThrow(SchemaValidationError);
  });

  it("rejects Infinity score", () => {
    expect(() => assertTeam({ ...validTeam, score: Infinity })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertProposal                                                     */
/* ------------------------------------------------------------------ */

const validProposal: Proposal = {
  teamId: "team_a_v1",
  productName: "MockProduct",
  oneLiner: "A test product.",
  targetUser: "developers",
  problem: "Testing is slow.",
  solution: "Use mocks.",
  mvpFeatures: ["feature-a"],
  demoPlan: "Demo plan here.",
  technicalHighlight: "Tech highlight here.",
  risks: ["risk-a"],
  whyThisCanWin: "Speed.",
};

describe("assertProposal", () => {
  it("passes on a valid proposal", () => {
    expect(() => assertProposal(validProposal)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertProposal("not a proposal")).toThrow(SchemaValidationError);
  });

  it("rejects empty productName", () => {
    expect(() => assertProposal({ ...validProposal, productName: "" })).toThrow(SchemaValidationError);
  });

  it("rejects mvpFeatures with non-string items", () => {
    expect(() => assertProposal({ ...validProposal, mvpFeatures: [123] })).toThrow(SchemaValidationError);
  });

  it("rejects risks that is not an array", () => {
    expect(() => assertProposal({ ...validProposal, risks: "risk" })).toThrow(SchemaValidationError);
  });

  it("rejects whitespace-only whyThisCanWin", () => {
    expect(() => assertProposal({ ...validProposal, whyThisCanWin: "  \t  " })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertAttack                                                       */
/* ------------------------------------------------------------------ */

const validAttack: Attack = {
  id: "atk_001",
  attackerTeamId: "team_b_v1",
  targetTeamId: "team_a_v1",
  attackType: "too_generic",
  claim: "Too generic.",
  evidence: "No differentiation.",
  severity: "medium",
  suggestedFix: "Niche down.",
};

describe("assertAttack", () => {
  it("passes on a valid attack", () => {
    expect(() => assertAttack(validAttack)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertAttack(undefined)).toThrow(SchemaValidationError);
  });

  it("rejects invalid attackType", () => {
    expect(() => assertAttack({ ...validAttack, attackType: "made_up" })).toThrow(SchemaValidationError);
  });

  it("rejects invalid severity", () => {
    expect(() => assertAttack({ ...validAttack, severity: "fatal" })).toThrow(SchemaValidationError);
  });

  it("rejects missing id", () => {
    expect(() => assertAttack({ ...validAttack, id: "" })).toThrow(SchemaValidationError);
  });

  it("rejects missing suggestedFix", () => {
    expect(() => assertAttack({ ...validAttack, suggestedFix: "" })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertDefense                                                      */
/* ------------------------------------------------------------------ */

const validDefense: Defense = {
  id: "def_001",
  attackId: "atk_001",
  teamId: "team_a_v1",
  targetTeamId: "team_b_v1",
  responseToAttack: "We are not generic.",
  acceptedAttack: false,
  revision: "Added more detail.",
};

describe("assertDefense", () => {
  it("passes on a valid defense with acceptedAttack=false", () => {
    expect(() => assertDefense(validDefense)).not.toThrow();
  });

  it("passes on a valid defense with acceptedAttack=true", () => {
    expect(() => assertDefense({ ...validDefense, acceptedAttack: true })).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertDefense(123)).toThrow(SchemaValidationError);
  });

  it("rejects non-boolean acceptedAttack", () => {
    expect(() => assertDefense({ ...validDefense, acceptedAttack: "yes" })).toThrow(SchemaValidationError);
  });

  it("rejects empty attackId", () => {
    expect(() => assertDefense({ ...validDefense, attackId: "" })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertScore                                                        */
/* ------------------------------------------------------------------ */

const validScore: Score = {
  teamId: "team_a_v1",
  scores: {
    novelty: 7,
    feasibility: 8,
    demoWow: 6,
    technicalDepth: 7,
    userValue: 8,
    longTermPotential: 7,
  },
  judgeComments: ["Good work."],
};

describe("assertScore", () => {
  it("passes on a valid score", () => {
    expect(() => assertScore(validScore)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertScore(null)).toThrow(SchemaValidationError);
  });

  it("rejects non-object scores breakdown", () => {
    expect(() => assertScore({ ...validScore, scores: "bad" })).toThrow(SchemaValidationError);
  });

  it("rejects out-of-range category scores", () => {
    expect(() => assertScore({ ...validScore, scores: { ...validScore.scores, novelty: 11 } })).toThrow(SchemaValidationError);
    expect(() => assertScore({ ...validScore, scores: { ...validScore.scores, novelty: -1 } })).toThrow(SchemaValidationError);
  });

  it("rejects non-numeric category scores", () => {
    expect(() => assertScore({ ...validScore, scores: { ...validScore.scores, novelty: "high" } })).toThrow(SchemaValidationError);
  });

  it("rejects judgeComments that is not a string array", () => {
    expect(() => assertScore({ ...validScore, judgeComments: [1] })).toThrow(SchemaValidationError);
  });

  it("accepts optional winningReason and losingReason", () => {
    expect(() => assertScore({ ...validScore, winningReason: "Great demo", losingReason: "Risky" })).not.toThrow();
  });

  it("rejects non-string winningReason", () => {
    expect(() => assertScore({ ...validScore, winningReason: 42 })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertArtifact                                                     */
/* ------------------------------------------------------------------ */

const validArtifact: Artifact = {
  id: "art_001",
  battleId: "btl_TESTTEST",
  type: "product_brief",
  title: "Mock Brief",
  content: "Mock brief content.",
};

describe("assertArtifact", () => {
  it("passes on a valid artifact", () => {
    expect(() => assertArtifact(validArtifact)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertArtifact("not an artifact")).toThrow(SchemaValidationError);
  });

  it("rejects invalid artifact type", () => {
    expect(() => assertArtifact({ ...validArtifact, type: "unknown" })).toThrow(SchemaValidationError);
  });

  it("rejects empty content", () => {
    expect(() => assertArtifact({ ...validArtifact, content: "" })).toThrow(SchemaValidationError);
  });

  it("rejects missing id", () => {
    expect(() => assertArtifact({ ...validArtifact, id: "" })).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertAgentPassport                                                */
/* ------------------------------------------------------------------ */

const validPassport: AgentPassport = {
  id: "passport_001",
  agentId: "agent_001",
  battleId: "btl_TESTTEST",
  agentName: "Safe Builder",
  role: "builder",
  directoryPath: "/agents/safe-builder",
  contributionSummary: "Did the work.",
  acceptedClaims: [
    {
      claim: "Too generic",
      attackId: "atk_001",
      defenseId: "def_001",
      acceptedAttack: true,
      attackerTeamId: "team_b_v1",
      defenderTeamId: "team_a_v1",
    },
  ],
  rejectedClaims: [
    {
      claim: "Bad demo",
      attackId: "atk_002",
      defenseId: "def_002",
      acceptedAttack: false,
      attackerTeamId: "team_c_v1",
      defenderTeamId: "team_a_v1",
    },
  ],
  strengths: ["Strong demo"],
  weaknesses: ["Risky"],
  contributionScore: 7.5,
};

describe("assertAgentPassport", () => {
  it("passes on a valid passport", () => {
    expect(() => assertAgentPassport(validPassport)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertAgentPassport("not a passport")).toThrow(SchemaValidationError);
  });

  it("rejects an acceptedClaims item with acceptedAttack=false (must be true)", () => {
    const bad = {
      ...validPassport,
      acceptedClaims: [
        {
          claim: "x",
          attackId: "a1",
          defenseId: "d1",
          acceptedAttack: false,
          attackerTeamId: "t1",
          defenderTeamId: "t2",
        },
      ],
    };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects a rejectedClaims item with acceptedAttack=true (must be false)", () => {
    const bad = {
      ...validPassport,
      rejectedClaims: [
        {
          claim: "x",
          attackId: "a1",
          defenseId: "d1",
          acceptedAttack: true,
          attackerTeamId: "t1",
          defenderTeamId: "t2",
        },
      ],
    };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects non-boolean acceptedAttack in claim evidence", () => {
    const bad = {
      ...validPassport,
      acceptedClaims: [
        {
          claim: "x",
          attackId: "a1",
          defenseId: "d1",
          acceptedAttack: "yes" as unknown as boolean,
          attackerTeamId: "t1",
          defenderTeamId: "t2",
        },
      ],
    };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects non-array acceptedClaims", () => {
    const bad = { ...validPassport, acceptedClaims: "not an array" };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects non-string strengths", () => {
    const bad = { ...validPassport, strengths: [1, 2] };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects out-of-range contributionScore", () => {
    const bad = { ...validPassport, contributionScore: 11 };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects empty agentName", () => {
    const bad = { ...validPassport, agentName: "" };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });

  it("rejects missing battleId", () => {
    const bad = { ...validPassport, battleId: "" };
    expect(() => assertAgentPassport(bad)).toThrow(SchemaValidationError);
  });
});

/* ------------------------------------------------------------------ */
/* assertBattleEvent                                                  */
/* ------------------------------------------------------------------ */

const validEvent: BattleEvent = {
  id: "evt_001",
  battleId: "btl_TESTTEST",
  round: "proposal_round",
  actorType: "system",
  actorId: undefined,
  targetId: undefined,
  eventType: "proposal_created",
  title: "Proposal created",
  content: "Details",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("assertBattleEvent", () => {
  it("passes on a valid event", () => {
    expect(() => assertBattleEvent(validEvent)).not.toThrow();
  });

  it("rejects non-object", () => {
    expect(() => assertBattleEvent(true)).toThrow(SchemaValidationError);
  });

  it("rejects invalid actorType", () => {
    expect(() => assertBattleEvent({ ...validEvent, actorType: "robot" })).toThrow(SchemaValidationError);
  });

  it("rejects invalid eventType", () => {
    expect(() => assertBattleEvent({ ...validEvent, eventType: "explosion" })).toThrow(SchemaValidationError);
  });

  it("accepts optional actorId and targetId", () => {
    expect(() => assertBattleEvent({ ...validEvent, actorId: "agent_1", targetId: "agent_2" })).not.toThrow();
  });

  it("rejects non-string actorId", () => {
    expect(() => assertBattleEvent({ ...validEvent, actorId: 42 })).toThrow(SchemaValidationError);
  });

  it("rejects empty round", () => {
    expect(() => assertBattleEvent({ ...validEvent, round: "" })).toThrow(SchemaValidationError);
  });

  it("rejects empty createdAt", () => {
    expect(() => assertBattleEvent({ ...validEvent, createdAt: "" })).toThrow(SchemaValidationError);
  });
});
