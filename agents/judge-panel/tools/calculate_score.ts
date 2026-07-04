export type ScoreBreakdown = {
  novelty: number;
  feasibility: number;
  demoWow: number;
  technicalDepth: number;
  userValue: number;
  longTermPotential: number;
};

export type CalculateScoreInput = {
  teamId: string;
  scores: ScoreBreakdown;
};

export type CalculatedScore = {
  teamId: string;
  total: number;
};

export const scoringWeights = {
  novelty: 0.2,
  feasibility: 0.2,
  demoWow: 0.2,
  technicalDepth: 0.15,
  userValue: 0.15,
  longTermPotential: 0.1,
} satisfies Record<keyof ScoreBreakdown, number>;

export function calculateScore(input: CalculateScoreInput): CalculatedScore {
  const total = Object.entries(scoringWeights).reduce((sum, [dimension, weight]) => {
    const score = input.scores[dimension as keyof ScoreBreakdown];
    return sum + clampScore(score) * weight;
  }, 0);

  return {
    teamId: input.teamId,
    total: roundToTwoDecimals(total),
  };
}

export function validateScoreBreakdown(scores: ScoreBreakdown): string[] {
  return Object.entries(scores)
    .filter(([, score]) => !Number.isFinite(score) || score < 0 || score > 100)
    .map(([dimension]) => dimension);
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, score));
}

function roundToTwoDecimals(score: number): number {
  return Math.round(score * 100) / 100;
}
