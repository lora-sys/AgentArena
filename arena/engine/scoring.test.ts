import { describe, expect, it } from "vitest";
import {
  attachCalculatedScores,
  calculateTotalScore,
  getScoreLeaders,
  scoreBreakdownToEntries,
  scoringWeights,
  selectChampion,
} from "./scoring";
import type { CalculatedScore, Score, ScoreBreakdown } from "../schemas";

const baseBreakdown: ScoreBreakdown = {
  novelty: 8,
  feasibility: 7,
  demoWow: 9,
  technicalDepth: 6,
  userValue: 8,
  longTermPotential: 7,
};

const makeScore = (overrides: Partial<Score> = {}): Score => ({
  teamId: "team_a_v1",
  scores: { ...baseBreakdown },
  judgeComments: ["solid"],
  ...overrides,
});

describe("scoringWeights", () => {
  it("defines a weight for every score category", () => {
    const expectedKeys = [
      "novelty",
      "feasibility",
      "demoWow",
      "technicalDepth",
      "userValue",
      "longTermPotential",
    ];
    for (const key of expectedKeys) {
      expect(scoringWeights).toHaveProperty(key);
    }
  });

  it("weights sum to 1.0", () => {
    const total = Object.values(scoringWeights).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it("all weights are positive", () => {
    for (const value of Object.values(scoringWeights)) {
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe("calculateTotalScore", () => {
  it("returns a weighted average rounded to 2 decimal places", () => {
    const score = makeScore();
    const expected =
      score.scores.novelty * scoringWeights.novelty +
      score.scores.feasibility * scoringWeights.feasibility +
      score.scores.demoWow * scoringWeights.demoWow +
      score.scores.technicalDepth * scoringWeights.technicalDepth +
      score.scores.userValue * scoringWeights.userValue +
      score.scores.longTermPotential * scoringWeights.longTermPotential;
    const result = calculateTotalScore(score);
    expect(result).toBe(Math.round(expected * 100) / 100);
  });

  it("returns 0 when all category scores are 0", () => {
    const score = makeScore({
      scores: {
        novelty: 0,
        feasibility: 0,
        demoWow: 0,
        technicalDepth: 0,
        userValue: 0,
        longTermPotential: 0,
      },
    });
    expect(calculateTotalScore(score)).toBe(0);
  });

  it("returns 10 when all category scores are 10", () => {
    const score = makeScore({
      scores: {
        novelty: 10,
        feasibility: 10,
        demoWow: 10,
        technicalDepth: 10,
        userValue: 10,
        longTermPotential: 10,
      },
    });
    expect(calculateTotalScore(score)).toBe(10);
  });

  it("produces different totals for different score distributions", () => {
    const a = makeScore({ teamId: "team_a", scores: { ...baseBreakdown, novelty: 10 } });
    const b = makeScore({ teamId: "team_b", scores: { ...baseBreakdown, novelty: 5 } });
    expect(calculateTotalScore(a)).toBeGreaterThan(calculateTotalScore(b));
  });

  it("rounds to at most 2 decimal places", () => {
    const score = makeScore({
      scores: {
        novelty: 7.333,
        feasibility: 7.333,
        demoWow: 7.333,
        technicalDepth: 7.333,
        userValue: 7.333,
        longTermPotential: 7.333,
      },
    });
    const result = calculateTotalScore(score);
    expect(result).toBe(Math.round(result * 100) / 100);
  });

  it("throws when the score object is malformed", () => {
    expect(() => calculateTotalScore({ teamId: "", scores: baseBreakdown, judgeComments: ["x"] } as unknown as Score)).toThrow();
  });
});

describe("attachCalculatedScores", () => {
  it("adds totalScore to each score", () => {
    const scores: Score[] = [makeScore({ teamId: "team_a" }), makeScore({ teamId: "team_b" })];
    const result = attachCalculatedScores(scores);
    expect(result).toHaveLength(2);
    for (const calculated of result) {
      expect(calculated.totalScore).toBeGreaterThan(0);
      expect(typeof calculated.totalScore).toBe("number");
    }
  });

  it("preserves the original score fields", () => {
    const original = makeScore({ teamId: "team_x" });
    const result = attachCalculatedScores([original]);
    expect(result[0].teamId).toBe("team_x");
    expect(result[0].scores).toEqual(baseBreakdown);
    expect(result[0].judgeComments).toEqual(["solid"]);
  });

  it("returns an empty array when given no scores", () => {
    expect(attachCalculatedScores([])).toEqual([]);
  });

  it("assigns different totalScores to different breakdowns", () => {
    const high = makeScore({ teamId: "high", scores: { ...baseBreakdown, novelty: 10 } });
    const low = makeScore({ teamId: "low", scores: { ...baseBreakdown, novelty: 1 } });
    const result = attachCalculatedScores([high, low]);
    const highResult = result.find((r) => r.teamId === "high");
    const lowResult = result.find((r) => r.teamId === "low");
    expect(highResult).toBeDefined();
    expect(lowResult).toBeDefined();
    expect(highResult!.totalScore).toBeGreaterThan(lowResult!.totalScore);
  });
});

describe("selectChampion", () => {
  const makeCalc = (teamId: string, totalScore: number, demoWow: number, novelty: number): CalculatedScore => ({
    teamId,
    scores: { ...baseBreakdown, demoWow, novelty },
    judgeComments: [],
    totalScore,
  });

  it("throws on an empty score list", () => {
    expect(() => selectChampion([])).toThrow("Cannot select a champion without scores");
  });

  it("selects the highest totalScore", () => {
    const scores: CalculatedScore[] = [
      makeCalc("team_a", 5, 5, 5),
      makeCalc("team_b", 8, 5, 5),
      makeCalc("team_c", 6, 5, 5),
    ];
    expect(selectChampion(scores).teamId).toBe("team_b");
  });

  it("breaks ties by demoWow", () => {
    const scores: CalculatedScore[] = [
      makeCalc("team_a", 7, 3, 5),
      makeCalc("team_b", 7, 9, 5),
      makeCalc("team_c", 7, 6, 5),
    ];
    expect(selectChampion(scores).teamId).toBe("team_b");
  });

  it("breaks demoWow ties by novelty", () => {
    const scores: CalculatedScore[] = [
      makeCalc("team_a", 7, 5, 3),
      makeCalc("team_b", 7, 5, 9),
      makeCalc("team_c", 7, 5, 6),
    ];
    expect(selectChampion(scores).teamId).toBe("team_b");
  });

  it("uses teamOrder as the final tiebreaker when all scores tie", () => {
    const scores: CalculatedScore[] = [
      makeCalc("team_c", 5, 5, 5),
      makeCalc("team_a", 5, 5, 5),
      makeCalc("team_b", 5, 5, 5),
    ];
    const champion = selectChampion(scores, ["team_c", "team_a", "team_b"]);
    expect(champion.teamId).toBe("team_c");
  });

  it("falls back to alphabetical teamId when teamOrder is empty and scores tie", () => {
    const scores: CalculatedScore[] = [
      makeCalc("team_b", 5, 5, 5),
      makeCalc("team_a", 5, 5, 5),
    ];
    const champion = selectChampion(scores, []);
    expect(champion.teamId).toBe("team_a");
  });

  it("does not mutate the input array", () => {
    const scores: CalculatedScore[] = [
      makeCalc("team_b", 5, 5, 5),
      makeCalc("team_a", 8, 5, 5),
    ];
    const original = [...scores];
    selectChampion(scores);
    expect(scores).toEqual(original);
  });
});

describe("getScoreLeaders", () => {
  it("returns an empty array for no scores", () => {
    expect(getScoreLeaders([])).toEqual([]);
  });

  it("returns all categories with their average", () => {
    const scores: CalculatedScore[] = [
      { ...makeScore({ teamId: "a", scores: { ...baseBreakdown, novelty: 8 } }), totalScore: 7 },
      { ...makeScore({ teamId: "b", scores: { ...baseBreakdown, novelty: 4 } }), totalScore: 5 },
    ];
    const result = getScoreLeaders(scores);
    expect(result).toHaveLength(6);
    const noveltyEntry = result.find(([key]) => key === "novelty");
    expect(noveltyEntry).toBeDefined();
    expect(noveltyEntry![1]).toBe(6);
  });

  it("sorts categories by average descending", () => {
    const scores: CalculatedScore[] = [
      {
        ...makeScore({
          teamId: "a",
          scores: {
            novelty: 10,
            feasibility: 2,
            demoWow: 5,
            technicalDepth: 5,
            userValue: 5,
            longTermPotential: 5,
          },
        }),
        totalScore: 5,
      },
    ];
    const result = getScoreLeaders(scores);
    expect(result[0][0]).toBe("novelty");
    expect(result[0][1]).toBe(10);
  });

  it("rounds category averages to 2 decimal places", () => {
    const scores: CalculatedScore[] = [
      {
        ...makeScore({
          teamId: "a",
          scores: { ...baseBreakdown, novelty: 7.555 },
        }),
        totalScore: 7,
      },
    ];
    const result = getScoreLeaders(scores);
    const noveltyEntry = result.find(([key]) => key === "novelty");
    expect(noveltyEntry![1]).toBe(Math.round(7.555 * 100) / 100);
  });
});

describe("scoreBreakdownToEntries", () => {
  it("returns one entry per score category in weight-declaration order", () => {
    const result = scoreBreakdownToEntries(baseBreakdown);
    expect(result.map(([key]) => key)).toEqual([
      "novelty",
      "feasibility",
      "demoWow",
      "technicalDepth",
      "userValue",
      "longTermPotential",
    ]);
  });

  it("preserves the numeric value for each category", () => {
    const result = scoreBreakdownToEntries(baseBreakdown);
    for (const [key, value] of result) {
      expect(value).toBe(baseBreakdown[key]);
    }
  });

  it("returns six entries for any input", () => {
    expect(scoreBreakdownToEntries(baseBreakdown)).toHaveLength(6);
  });
});
