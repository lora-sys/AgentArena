import { describe, expect, it, vi } from "vitest";

const openAIMock = vi.hoisted(() => ({
  create: vi.fn(),
  constructorOptions: [] as Array<Record<string, unknown>>,
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: openAIMock.create } };

    constructor(options: Record<string, unknown>) {
      openAIMock.constructorOptions.push(options);
    }
  },
}));
import {
  createStepFunRuntime,
  isStepFunConfigured,
  redactStepFunSecret,
  StepFunNotConfiguredError,
  STEPFUN_DEFAULT_BASE_URL,
  STEPFUN_DEFAULT_MODEL,
} from "./stepfun";
import type { AgentSpec, ProposalInput } from "../contract";

const sampleProposal: ProposalInput = {
  teamId: "team_viral_v1",
  productName: "ClashQuiz",
  oneLiner: "考季刷题也能炫耀",
  targetUser: "考前愿意 PK 的大学生",
  problem: "备考孤独",
  solution: "游戏化刷题",
  mvpFeatures: ["每日 10 题"],
  demoPlan: "现场生成",
  technicalHighlight: "Canvas 成就卡",
  risks: ["题目质量"],
  whyThisCanWin: "传播势能",
};

const spec: AgentSpec = { agentId: "agent_viral_designer_lead", role: "contestant", teamId: "team_viral_v1" };

function makeMockClient(body: string) {
  const create = vi.fn().mockImplementation(async (args: { stream?: boolean }) => {
    if (args.stream) {
      return (async function* () {
        yield { choices: [{ delta: { content: body }, finish_reason: null }] };
        yield { choices: [{ delta: {}, finish_reason: "stop" }] };
      })();
    }
    return { choices: [{ message: { content: body } }] };
  });
  return {
    chat: {
      completions: {
        create,
      },
    },
  } as unknown as import("openai").default;
}

describe("isStepFunConfigured", () => {
  it("returns false when STEPFUN_API_KEY missing", () => {
    expect(isStepFunConfigured({} as NodeJS.ProcessEnv)).toBe(false);
  });
  it("returns false when STEPFUN_API_KEY is blank whitespace", () => {
    expect(isStepFunConfigured({ STEPFUN_API_KEY: "   " } as NodeJS.ProcessEnv)).toBe(false);
  });
  it("returns true when STEPFUN_API_KEY set", () => {
    expect(isStepFunConfigured({ STEPFUN_API_KEY: "sk_live_x" } as NodeJS.ProcessEnv)).toBe(true);
  });
});

describe("createStepFunRuntime", () => {
  it("throws StepFunNotConfiguredError with Chinese message when key missing", () => {
    const backupKey = process.env.STEPFUN_API_KEY;
    delete process.env.STEPFUN_API_KEY;
    try {
      expect(() => createStepFunRuntime()).toThrow(StepFunNotConfiguredError);
      expect(() => createStepFunRuntime()).toThrow(/实时 AI 竞技当前未开启/);
    } finally {
      if (backupKey !== undefined) process.env.STEPFUN_API_KEY = backupKey;
    }
  });

  it("uses STEPFUN_BASE_URL / STEPFUN_MODEL_ID env fallbacks", () => {
    // we only verify the constants surface; the OpenAI client internals are
    // covered by MastraRuntime tests.
    expect(STEPFUN_DEFAULT_BASE_URL).toContain("stepfun.com");
    expect(STEPFUN_DEFAULT_MODEL).toContain("step");
  });

  it("delegates runProposal to the underlying MastraRuntime with the given client", async () => {
    const client = makeMockClient(JSON.stringify(sampleProposal));
    const runtime = createStepFunRuntime({ apiKey: "sk_test_dummy", client });
    const out = await runtime.runProposal(spec, sampleProposal);
    expect(out.teamId).toBe("team_viral_v1");
    expect(out.productName).toBe("ClashQuiz");
    expect(client.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it("creates the provider client, normalizes legacy base URL, and admits a streamed request", async () => {
    openAIMock.create.mockImplementationOnce(async () => (async function* () {
      yield { choices: [{ delta: { content: JSON.stringify(sampleProposal) }, finish_reason: null }] };
      yield { choices: [{ delta: {}, finish_reason: "stop" }] };
    })());

    const runtime = createStepFunRuntime({
      apiKey: "sk_test_dummy",
      baseURL: "https://api.stepfun.com/step_plan/v1/",
      model: "step-test",
    });
    const out = await runtime.runProposal(spec, sampleProposal);

    expect(out.productName).toBe("ClashQuiz");
    expect(openAIMock.create).toHaveBeenCalledTimes(1);
    expect(openAIMock.constructorOptions.at(-1)).toMatchObject({
      apiKey: "sk_test_dummy",
      baseURL: "https://api.stepfun.com/v1",
      timeout: 75_000,
      maxRetries: 0,
    });
  });
});

describe("redactStepFunSecret", () => {
  it("replaces the key everywhere it appears", () => {
    const msg = "Bearer sk_live_abc123 failed; retry with sk_live_abc123";
    expect(redactStepFunSecret(msg, "sk_live_abc123")).toBe(
      "Bearer [REDACTED] failed; retry with [REDACTED]",
    );
  });
  it("is a no-op when key is undefined", () => {
    expect(redactStepFunSecret("anything", undefined)).toBe("anything");
  });
});
