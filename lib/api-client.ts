import { z } from "zod";
import { artifactTypes, battleStatuses, battleTypes } from "@/arena/schemas/types";

/* ------------------------------------------------------------------ */
/* Zod schemas for the Battle API response                             */
/* ------------------------------------------------------------------ */

/**
 * Schema for the `battle` summary object returned by GET /api/battles/[id].
 * Matches the output of `summarizeBattleBundle()` in lib/battle-api.ts.
 */
export const BattleSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  idea: z.string(),
  status: z.enum(battleStatuses),
  type: z.enum(battleTypes),
  winnerTeamId: z.string().optional(),
  winnerName: z.string().optional(),
  winnerScore: z.number().optional(),
  teamCount: z.number(),
  eventCount: z.number(),
  artifactCount: z.number(),
  passportCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema for a single score row from the bundle, augmented with
 * the evidenceEventId from the matching `score_created` event.
 * Satisfies CLAUDE.md §7: "Every Score binds to >=1 evidenceEventId".
 */
export const BattleScoreRowSchema = z.object({
  teamId: z.string().min(1),
  teamName: z.string().min(1),
  totalScore: z.number(),
  scores: z.object({
    novelty: z.number(),
    feasibility: z.number(),
    demoWow: z.number(),
    technicalDepth: z.number(),
    userValue: z.number(),
    longTermPotential: z.number(),
  }),
  judgeComments: z.array(z.string()),
  winningReason: z.string().optional(),
  losingReason: z.string().optional(),
  evidenceEventId: z.string().min(1),
});

/**
 * Schema for a single artifact from the bundle.
 */
export const BattleArtifactSchema = z.object({
  id: z.string().min(1),
  type: z.enum(artifactTypes),
  title: z.string().min(1),
  content: z.string().min(1),
});

/**
 * Schema for the full server response from GET /api/battles/[id].
 *
 * Server returns: { battle: BattleSummary, bundle: CompletedBattleBundle }
 * The bundle contains the full domain payload (teams, scores, artifacts,
 * events, etc.). We validate the minimal structure needed by the result
 * page.
 */
export const BattleApiResponseSchema = z.object({
  battle: BattleSummarySchema,
  bundle: z.object({
    battle: z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      idea: z.string(),
      status: z.enum(battleStatuses),
      winnerTeamId: z.string().optional(),
    }),
    teams: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        strategy: z.string(),
      }),
    ),
    scores: z.array(
      z.object({
        teamId: z.string().min(1),
        scores: z.object({
          novelty: z.number(),
          feasibility: z.number(),
          demoWow: z.number(),
          technicalDepth: z.number(),
          userValue: z.number(),
          longTermPotential: z.number(),
        }),
        judgeComments: z.array(z.string()),
        winningReason: z.string().optional(),
        losingReason: z.string().optional(),
        totalScore: z.number(),
      }),
    ),
    artifacts: z.array(BattleArtifactSchema),
    events: z.array(
      z.object({
        id: z.string().min(1),
        eventType: z.string(),
        actorId: z.string().optional(),
        targetId: z.string().optional(),
        title: z.string(),
      }),
    ),
  }),
});

/* ------------------------------------------------------------------ */
/* Public types                                                        */
/* ------------------------------------------------------------------ */

export type BattleApiResponse = z.infer<typeof BattleApiResponseSchema>;
export type BattleScoreRow = z.infer<typeof BattleScoreRowSchema>;
export type BattleArtifact = z.infer<typeof BattleArtifactSchema>;

/**
 * The flat, page-friendly battle result shape returned by `fetchBattleResult()`.
 * This is what the result page consumes directly.
 */
export type BattleResult = {
  id: string;
  title: string;
  idea: string;
  status: string;
  type: string;
  winnerTeamId?: string;
  winnerName?: string;
  winnerScore?: number;
  scores: BattleScoreRow[];
  artifacts: BattleArtifact[];
  teamNames: Record<string, string>;
  evidenceEventIds: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Error class                                                         */
/* ------------------------------------------------------------------ */

export class BattleApiError extends Error {
  readonly status: number;
  readonly issues?: string[];

  constructor(message: string, status: number, issues?: string[]) {
    super(message);
    this.name = "BattleApiError";
    this.status = status;
    this.issues = issues;
  }
}

/* ------------------------------------------------------------------ */
/* URL builders                                                        */
/* ------------------------------------------------------------------ */

/**
 * Builds the Markdown export URL for a battle.
 * The server endpoint at /api/battles/[id]/export streams the full
 * battle bundle as a markdown download.
 */
export function buildExportMarkdownUrl(battleId: string): string {
  return `/api/battles/${encodeURIComponent(battleId)}/export`;
}

/**
 * Builds the Replay page URL for a battle.
 */
export function buildReplayUrl(battleId: string): string {
  return `/battle/${encodeURIComponent(battleId)}/replay`;
}

/**
 * Builds the Passport page URL for the champion team of a battle.
 */
export function buildPassportUrl(battleId: string, teamId: string): string {
  return `/agent/${encodeURIComponent(teamId)}/passport`;
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Finds the evidenceEventId for a score by looking up the
 * `score_created` event whose `targetId` matches the team's id.
 */
function findScoreEvidenceEventId(
  events: Array<{ id: string; eventType: string; targetId?: string }>,
  teamId: string,
): string {
  const match = events.find(
    (event) => event.eventType === "score_created" && event.targetId === teamId,
  );
  return match?.id ?? `unknown-${teamId}`;
}

/**
 * Transforms the raw API bundle into the flat BattleResult shape
 * the result page needs (champion card, scoreboard, artifact list).
 */
function transformBundle(raw: BattleApiResponse): BattleResult {
  const { battle, bundle } = raw;

  const teamNames: Record<string, string> = {};
  for (const team of bundle.teams) {
    teamNames[team.id] = team.name;
  }

  const evidenceEventIds: Record<string, string> = {};
  for (const score of bundle.scores) {
    evidenceEventIds[score.teamId] = findScoreEvidenceEventId(bundle.events, score.teamId);
  }

  const scoreRows: BattleScoreRow[] = bundle.scores.map((score) => ({
    teamId: score.teamId,
    teamName: teamNames[score.teamId] ?? score.teamId,
    totalScore: score.totalScore,
    scores: score.scores,
    judgeComments: score.judgeComments,
    winningReason: score.winningReason,
    losingReason: score.losingReason,
    evidenceEventId: evidenceEventIds[score.teamId],
  }));

  return {
    id: battle.id,
    title: battle.title,
    idea: battle.idea,
    status: battle.status,
    type: battle.type,
    winnerTeamId: battle.winnerTeamId,
    winnerName: battle.winnerName,
    winnerScore: battle.winnerScore,
    scores: scoreRows,
    artifacts: bundle.artifacts,
    teamNames,
    evidenceEventIds,
    createdAt: battle.createdAt,
    updatedAt: battle.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Main API                                                            */
/* ------------------------------------------------------------------ */

/**
 * Fetches a battle result from GET /api/battles/[id].
 *
 * Returns a validated, page-friendly `BattleResult`. Throws `BattleApiError`
 * on HTTP failure or Zod validation failure. Validates every score binds to
 * an evidenceEventId before returning (CLAUDE.md §7 invariant).
 */
export async function fetchBattleResult(battleId: string): Promise<BattleResult> {
  const url = `/api/battles/${encodeURIComponent(battleId)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (cause) {
    throw new BattleApiError(
      `Network error fetching battle ${battleId}: ${cause instanceof Error ? cause.message : String(cause)}`,
      0,
    );
  }

  if (!response.ok) {
    throw new BattleApiError(
      `Battle ${battleId} returned HTTP ${response.status}`,
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new BattleApiError(
      `Battle ${battleId} returned invalid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
      response.status,
    );
  }

  const result = BattleApiResponseSchema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new BattleApiError(
      `Battle ${battleId} response failed validation`,
      response.status,
      issues,
    );
  }

  return transformBundle(result.data);
}