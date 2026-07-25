/**
 * Manual StepFun smoke test for #21 / issue #42.
 *
 * Run:
 *   pnpm tsx scripts/stepfun-smoke.ts
 *
 * Verifies:
 *   1. STEPFUN_API_KEY present (else exit with the same 501 message the API uses)
 *   2. createStepFunRuntime returns a working ArenaAgentRuntime
 *   3. A single runProposal call against the real StepFun endpoint returns
 *      schema-valid JSON (no repair exhausted)
 *   4. The API key never appears in any log output
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — StepFun not configured (STEPFUN_API_KEY missing)
 *   2 — Live call failed (schema repair exhausted or HTTP error)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env.local loader (no dotenv dependency in this repo).
// Parses KEY=VALUE lines, ignores comments and blank lines, strips one
// level of surrounding quotes. Existing process.env values win.
function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvLocal();

import { createStepFunRuntime, isStepFunConfigured, redactStepFunSecret, StepFunNotConfiguredError } from "../lib/runtime/providers/stepfun";
import type { ProposalInput } from "../lib/runtime/contract";

const sampleProposal: ProposalInput = {
  teamId: "team_viral_v1",
  productName: "ClashQuiz",
  oneLiner: "考季刷题也能炫耀",
  targetUser: "考前愿意 PK 的大学生",
  problem: "备考孤独，现有工具没有社交反馈。",
  solution: "每日挑战 + 成就卡 + 群组排行榜。",
  mvpFeatures: ["每日 10 题挑战", "成就卡生成与分享", "群组排行榜"],
  demoPlan: "现场生成 1 张成就卡 + 展示排行榜 UI。",
  technicalHighlight: "成就卡走 Canvas 渲染，无后端依赖。",
  risks: ["题目质量被游戏化稀释"],
  whyThisCanWin: "考季是传播高峰；分享卡带来自然裂变。",
};

async function main(): Promise<void> {
  console.log("[stepfun-smoke] starting");

  if (!isStepFunConfigured()) {
    console.error("[stepfun-smoke] STEPFUN_API_KEY not configured.");
    console.error("[stepfun-smoke] API would respond: 实时 AI 竞技当前未开启 (501)");
    process.exit(1);
  }
  console.log("[stepfun-smoke] STEPFUN_API_KEY detected (masked)");
  console.log(`[stepfun-smoke] STEPFUN_BASE_URL=${process.env.STEPFUN_BASE_URL ?? "(default)"}`);
  console.log(`[stepfun-smoke] STEPFUN_MODEL_ID=${process.env.STEPFUN_MODEL_ID ?? "(default)"}`);

  let runtime: ReturnType<typeof createStepFunRuntime>;
  try {
    runtime = createStepFunRuntime();
  } catch (err) {
    if (err instanceof StepFunNotConfiguredError) {
      console.error("[stepfun-smoke]", err.message);
      process.exit(1);
    }
    throw err;
  }

  const spec = {
    agentId: "agent_viral_designer_lead",
    role: "contestant" as const,
    teamId: "team_viral_v1",
  };

  console.log("[stepfun-smoke] invoking runProposal…");
  const started = Date.now();
  try {
    const out = await runtime.runProposal(spec, sampleProposal);
    const elapsed = Date.now() - started;
    console.log(`[stepfun-smoke] ok in ${elapsed}ms`);
    console.log(`[stepfun-smoke] productName=${out.productName} oneLiner=${out.oneLiner}`);
    // Final safety: nothing printed may contain the key.
    const dump = JSON.stringify(out);
    const redacted = redactStepFunSecret(dump);
    if (redacted !== dump) {
      console.error("[stepfun-smoke] SECURITY: proposal payload contained the API key!");
      process.exit(2);
    }
  } catch (err) {
    const elapsed = Date.now() - started;
    const raw = err instanceof Error ? err.message : String(err);
    console.error(`[stepfun-smoke] FAILED after ${elapsed}ms`);
    console.error(`[stepfun-smoke] ${redactStepFunSecret(raw)}`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("[stepfun-smoke] fatal:", err instanceof Error ? err.message : String(err));
  process.exit(2);
});
