import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchBattleResult,
  BattleApiError,
  buildExportMarkdownUrl,
  buildReplayUrl,
  buildPassportUrl,
} from "./api-client";

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const validBattleId = "battle-8f2a";

const validApiResponse = {
  battle: {
    id: validBattleId,
    title: "Battle #42",
    idea: "AI app for voice notes",
    status: "completed" as const,
    type: "hackathon" as const,
    winnerTeamId: "team_viral_designer_v1",
    winnerName: "Viral Designer",
    winnerScore: 8.1,
    teamCount: 3,
    eventCount: 42,
    artifactCount: 6,
    passportCount: 3,
    createdAt: "2026-07-04T18:30:00.000Z",
    updatedAt: "2026-07-04T18:48:36.000Z",
  },
  bundle: {
    battle: {
      id: validBattleId,
      title: "Battle #42",
      idea: "AI app for voice notes",
      status: "completed" as const,
      winnerTeamId: "team_viral_designer_v1",
    },
    teams: [
      { id: "team_safe_builder_v1", name: "Safe Builder", strategy: "Feasibility first" },
      { id: "team_viral_designer_v1", name: "Viral Designer", strategy: "Make it memorable" },
      { id: "team_infra_hacker_v1", name: "Infra Hacker", strategy: "Tech depth first" },
    ],
    scores: [
      {
        teamId: "team_safe_builder_v1",
        scores: {
          novelty: 7.5,
          feasibility: 9.0,
          demoWow: 6.0,
          technicalDepth: 8.5,
          userValue: 8.0,
          longTermPotential: 7.0,
        },
        judgeComments: ["Solid feasibility", "Low novelty"],
        winningReason: undefined,
        losingReason: "Lower novelty and demoWow",
        totalScore: 7.7,
      },
      {
        teamId: "team_viral_designer_v1",
        scores: {
          novelty: 9.0,
          feasibility: 7.0,
          demoWow: 9.5,
          technicalDepth: 6.5,
          userValue: 8.5,
          longTermPotential: 8.5,
        },
        judgeComments: ["Compelling pitch", "Strong demo"],
        winningReason: "Highest novelty and demoWow",
        losingReason: undefined,
        totalScore: 8.1,
      },
      {
        teamId: "team_infra_hacker_v1",
        scores: {
          novelty: 6.0,
          feasibility: 8.5,
          demoWow: 5.5,
          technicalDepth: 9.5,
          userValue: 7.0,
          longTermPotential: 7.5,
        },
        judgeComments: ["Deep tech", "Weak demo"],
        winningReason: undefined,
        losingReason: "Lowest demoWow",
        totalScore: 7.3,
      },
    ],
    artifacts: [
      {
        id: "art_1",
        type: "product_brief" as const,
        title: "Product Brief",
        content: "# Brief\n\nDescription here.",
      },
      {
        id: "art_2",
        type: "prd" as const,
        title: "PRD",
        content: "# PRD\n\nRequirements here.",
      },
    ],
    events: [
      {
        id: "evt_score_1",
        eventType: "score_created",
        actorId: "judge_panel",
        targetId: "team_safe_builder_v1",
        title: "Safe Builder scored 7.70",
      },
      {
        id: "evt_score_2",
        eventType: "score_created",
        actorId: "judge_panel",
        targetId: "team_viral_designer_v1",
        title: "Viral Designer scored 8.10",
      },
      {
        id: "evt_score_3",
        eventType: "score_created",
        actorId: "judge_panel",
        targetId: "team_infra_hacker_v1",
        title: "Infra Hacker scored 7.30",
      },
      {
        id: "evt_champ",
        eventType: "champion_selected",
        actorId: "battle_engine",
        targetId: "team_viral_designer_v1",
        title: "Viral Designer wins",
      },
    ],
  },
};

function mockFetchResponse(body: unknown, init: { status?: number; ok?: boolean } = {}): Response {
  const status = init.status ?? 200;
  const ok = init.ok ?? (status >= 200 && status < 300);
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as Response;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("fetchBattleResult", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns a validated BattleResult on success", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse(validApiResponse, { status: 200 }),
    );

    const result = await fetchBattleResult(validBattleId);

    expect(result.id).toBe(validBattleId);
    expect(result.winnerTeamId).toBe("team_viral_designer_v1");
    expect(result.winnerName).toBe("Viral Designer");
    expect(result.winnerScore).toBe(8.1);
    expect(result.scores).toHaveLength(3);

    // Every score must bind to an evidenceEventId (CLAUDE.md §7 invariant)
    for (const score of result.scores) {
      expect(score.evidenceEventId).toBeTruthy();
      expect(score.evidenceEventId).not.toMatch(/^unknown-/);
    }

    // Evidence binding must point to the correct event
    const viralScore = result.scores.find((s) => s.teamId === "team_viral_designer_v1");
    expect(viralScore?.evidenceEventId).toBe("evt_score_2");

    // Team names mapped correctly
    expect(result.teamNames["team_viral_designer_v1"]).toBe("Viral Designer");

    // Artifacts passed through
    expect(result.artifacts).toHaveLength(2);
    expect(result.artifacts[0].type).toBe("product_brief");

    // Verify the correct URL was hit
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/battles/${validBattleId}`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Accept: "application/json" }),
      }),
    );
  });

  it("throws BattleApiError on 404", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse({ error: "not found" }, { status: 404, ok: false }),
    );

    try {
      await fetchBattleResult("nonexistent");
      expect.fail("Expected fetchBattleResult to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BattleApiError);
      const apiError = error as BattleApiError;
      expect(apiError.status).toBe(404);
      expect(apiError.message).toContain("HTTP 404");
    }
  });

  it("throws BattleApiError with validation issues on malformed response", async () => {
    const malformed = {
      battle: {
        id: validBattleId,
        // missing required fields: title, status, type, etc.
      },
      bundle: {},
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse(malformed, { status: 200 }),
    );

    try {
      await fetchBattleResult(validBattleId);
      expect.fail("Expected fetchBattleResult to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BattleApiError);
      const apiError = error as BattleApiError;
      expect(apiError.status).toBe(200);
      expect(apiError.issues).toBeDefined();
      expect(apiError.issues!.length).toBeGreaterThan(0);
      expect(apiError.message).toContain("validation");
    }
  });

  it("throws BattleApiError on invalid status enum value", async () => {
    const invalidStatus = {
      ...validApiResponse,
      battle: { ...validApiResponse.battle, status: "bogus_status" },
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse(invalidStatus, { status: 200 }),
    );

    await expect(fetchBattleResult(validBattleId)).rejects.toThrow(BattleApiError);
  });

  it("throws BattleApiError on invalid eventType enum value", async () => {
    const invalidEventType = {
      ...validApiResponse,
      bundle: {
        ...validApiResponse.bundle,
        events: [
          { id: "evt_bad", eventType: "not_a_real_event", title: "Bogus" },
        ],
      },
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse(invalidEventType, { status: 200 }),
    );

    try {
      await fetchBattleResult(validBattleId);
      expect.fail("Expected fetchBattleResult to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BattleApiError);
      const apiError = error as BattleApiError;
      expect(apiError.message).toContain("validation");
    }
  });

  it("throws BattleApiError when a score has no matching evidence event (invariant violation)", async () => {
    const missingEvidence = {
      ...validApiResponse,
      bundle: {
        ...validApiResponse.bundle,
        events: [
          {
            id: "evt_champ",
            eventType: "champion_selected",
            actorId: "battle_engine",
            targetId: "team_viral_designer_v1",
            title: "Viral Designer wins",
          },
        ],
      },
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse(missingEvidence, { status: 200 }),
    );

    try {
      await fetchBattleResult(validBattleId);
      expect.fail("Expected fetchBattleResult to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BattleApiError);
      const apiError = error as BattleApiError;
      expect(apiError.status).toBe(404);
      expect(apiError.message).toContain("no evidence event");
    }
  });

  it("throws BattleApiError on network failure", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("ECONNREFUSED"),
    );

    try {
      await fetchBattleResult(validBattleId);
      expect.fail("Expected fetchBattleResult to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BattleApiError);
      const apiError = error as BattleApiError;
      expect(apiError.status).toBe(0);
      expect(apiError.message).toContain("Network error");
    }
  });
      it("encodes special characters in battleId", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetchResponse(validApiResponse, { status: 200 }),
    );

    await fetchBattleResult("battle/with spaces");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/battles/battle%2Fwith%20spaces",
      expect.any(Object),
    );
  });
});

describe("URL builders", () => {
  it("buildExportMarkdownUrl encodes the battleId", () => {
    expect(buildExportMarkdownUrl("battle-8f2a")).toBe("/api/battles/battle-8f2a/export");
    expect(buildExportMarkdownUrl("battle/8f2a")).toBe("/api/battles/battle%2F8f2a/export");
  });

  it("buildReplayUrl returns the replay page path", () => {
    expect(buildReplayUrl("battle-8f2a")).toBe("/battle/battle-8f2a/replay");
  });

  it("buildPassportUrl returns the agent passport path", () => {
    expect(buildPassportUrl("battle-8f2a", "team_viral_designer_v1")).toBe(
      "/agent/team_viral_designer_v1/passport",
    );
  });
});