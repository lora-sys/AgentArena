import OpenAI from "openai";
import { MastraRuntime, type MastraRuntimeOptions } from "../mastra";
import type { ArenaAgentRuntime } from "../contract";

/**
 * StepFun （阶跃星辰） provider for `live_runtime` mode.
 *
 * StepFun exposes an OpenAI-compatible chat-completions endpoint. We reuse
 * `MastraRuntime`'s OpenAI SDK client, repair loop, and MockRuntime fallback —
 * the only differences are (a) which env vars we read and (b) a tighter
 * timeout budget so the 90s live-battle cap stays achievable.
 *
 * Configuration (server-only; never shipped to the web bundle):
 *   STEPFUN_API_KEY    — required for live_runtime
 *   STEPFUN_BASE_URL   — default https://api.stepfun.com/v1
 *   STEPFUN_MODEL_ID   — default step-3.5-flash-2603 for the low-latency live path
 *
 * Write-lock (docs/DEV-STANDARDS.md §7):
 *   - Secret is read from process.env only inside this file.
 *   - No logging of the API key; the constructor argument is not serialised
 *     anywhere and no error message includes request headers.
 *   - If STEPFUN_API_KEY is missing, `createStepFunRuntime` throws with a
 *     Chinese-facing message so POST /api/battles can return 501.
 */

export const STEPFUN_DEFAULT_BASE_URL = "https://api.stepfun.com/v1";
export const STEPFUN_DEFAULT_MODEL = "step-3.5-flash-2603";

const STEPFUN_RPM_WINDOW_MS = 60_000;
const STEPFUN_SAFE_RPM = 9;
const stepFunRequestTimes: number[] = [];
let stepFunAdmissionQueue: Promise<void> = Promise.resolve();

async function admitStepFunRequest(): Promise<void> {
  let release!: () => void;
  const previous = stepFunAdmissionQueue;
  stepFunAdmissionQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    while (true) {
      const now = Date.now();
      while (stepFunRequestTimes.length > 0 && now - stepFunRequestTimes[0] >= STEPFUN_RPM_WINDOW_MS) {
        stepFunRequestTimes.shift();
      }
      if (stepFunRequestTimes.length < STEPFUN_SAFE_RPM) {
        stepFunRequestTimes.push(now);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.max(25, STEPFUN_RPM_WINDOW_MS - (now - stepFunRequestTimes[0]))));
    }
  } finally {
    release();
  }
}

export type StepFunRuntimeOptions = Omit<MastraRuntimeOptions, "client" | "model"> & {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  /** Optional pre-built OpenAI client (for tests). */
  client?: OpenAI;
};

export class StepFunNotConfiguredError extends Error {
  constructor(message = "实时 AI 竞技当前未开启：缺少 STEPFUN_API_KEY 配置") {
    super(message);
    this.name = "StepFunNotConfiguredError";
  }
}

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isStepFunConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const key = env.STEPFUN_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

export function createStepFunRuntime(options: StepFunRuntimeOptions = {}): ArenaAgentRuntime {
  const apiKey = options.apiKey ?? readEnv("STEPFUN_API_KEY");
  if (!apiKey) {
    throw new StepFunNotConfiguredError();
  }
  const baseURL = normalizeBaseURL(options.baseURL ?? readEnv("STEPFUN_BASE_URL") ?? STEPFUN_DEFAULT_BASE_URL);
  const model = options.model ?? readEnv("STEPFUN_MODEL_ID") ?? STEPFUN_DEFAULT_MODEL;

  const client =
    options.client ??
    new OpenAI({
      apiKey,
      baseURL,
      // Live mode budget: P95 total ≤ 90s, first event ≤ 10s. A single call
      // must never eat the whole budget; cap per-request at 30s and let the
      // orchestrator abort on its own deadline.
      timeout: 75_000,
      maxRetries: 0,
    });

  return new MastraRuntime({
    client,
    model,
    maxRetries: options.maxRetries,
    onEvent: options.onEvent,
    signal: options.signal,
    streamResponses: true,
    onStreamProgress: options.onStreamProgress,
    beforeRequest: options.client ? undefined : admitStepFunRequest,
    fallbackOnError: false,
  });
}

function normalizeBaseURL(value: string): string {
  return value.replace(/\/step_plan\/v1\/?$/i, "/v1");
}

/**
 * Redaction helper used by smoke tests and telemetry: guarantee the API key
 * never appears in any string we ship to logs.
 */
export function redactStepFunSecret(input: string, apiKey: string | undefined = readEnv("STEPFUN_API_KEY")): string {
  if (!apiKey) return input;
  return input.split(apiKey).join("[REDACTED]");
}
