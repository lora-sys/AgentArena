import { assertScore, type CalculatedScore, type Score, type ScoreBreakdown, type ScoreCategory } from "../schemas";

export const scoringWeights = {
  novelty: 0.2,
  feasibility: 0.2,
  demoWow: 0.2,
  technicalDepth: 0.15,
  userValue: 0.15,
  longTermPotential: 0.1,
} satisfies Record<ScoreCategory, number>;

const scoreKeys = Object.keys(scoringWeights) as ScoreCategory[];

const roundScore = (value: number): number => Math.round(value * 100) / 100;

export function calculateTotalScore(score: Score): number {
  assertScore(score);

  const total = scoreKeys.reduce((sum, key) => sum + score.scores[key] * scoringWeights[key], 0);
  return roundScore(total);
}

export function attachCalculatedScores(scores: Score[]): CalculatedScore[] {
  return scores.map((score) => ({
    ...score,
    totalScore: calculateTotalScore(score),
  }));
}

export function selectChampion(scores: CalculatedScore[], teamOrder: string[] = []): CalculatedScore {
  if (scores.length === 0) {
    throw new Error("Cannot select a champion without scores");
  }

  const teamOrderIndex = new Map(teamOrder.map((teamId, index) => [teamId, index]));
  const orderedScores = [...scores].sort((left, right) => {
    if (right.totalScore !== left.totalScore) {
      return right.totalScore - left.totalScore;
    }

    if (right.scores.demoWow !== left.scores.demoWow) {
      return right.scores.demoWow - left.scores.demoWow;
    }

    if (right.scores.novelty !== left.scores.novelty) {
      return right.scores.novelty - left.scores.novelty;
    }

    const leftOrder = teamOrderIndex.get(left.teamId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = teamOrderIndex.get(right.teamId) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.teamId.localeCompare(right.teamId);
  });

  return orderedScores[0];
}

export function getScoreLeaders(scores: CalculatedScore[]): Array<[ScoreCategory, number]> {
  if (scores.length === 0) {
    return [];
  }

  const totals = scoreKeys.map((key) => {
    const categoryTotal = scores.reduce((sum, score) => sum + score.scores[key], 0);
    return [key, roundScore(categoryTotal / scores.length)] as [ScoreCategory, number];
  });

  return totals.sort((left, right) => right[1] - left[1]);
}

export function scoreBreakdownToEntries(scores: ScoreBreakdown): Array<[ScoreCategory, number]> {
  return scoreKeys.map((key) => [key, scores[key]]);
}
