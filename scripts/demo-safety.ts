/**
 * #46 Demo Safety 20 次连测：verified_replay 主链路稳定性。
 *
 * Run:
 *   pnpm tsx scripts/demo-safety.ts
 *
 * 依赖 P1 交付 #34 Live Arena 页面后跑。当前版本用 HTTP 层探测 + 模拟
 * agent-browser 行为，等 P1 落地后再用真 agent-browser 替换（保留同样
 * 报告 schema）。
 *
 * 流程（每场）：
 *   1. GET /api/battles/BA-2026-0024/events（验证 fixture 通）
 *   2. 模拟 agent-browser：navigate http://localhost:5188/ → /battle/BA-2026-0024 → /battle/BA-2026-0024/champion
 *   3. 记录耗时 / HTTP 错误 / 空事件流
 *
 * 允许最多 1 次非致命警告；任何 error / 空数据 → 阻塞 Pitch。
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const TOTAL_RUNS = 20;
const API_BASE = process.env.AGENT_ARENA_API ?? "http://localhost:8787";
const WEB_BASE = process.env.AGENT_ARENA_WEB ?? "http://localhost:5188";
const BATTLE_ID = "BA-2026-0024";

type RunOutcome = {
  runIndex: number;
  apiEventsMs: number;
  apiEventsCount: number;
  webLandingMs: number;
  webLiveMs: number;
  webChampionMs: number;
  errors: string[];
};

async function timeFetch(url: string): Promise<{ ms: number; status: number; body?: unknown; error?: string }> {
  const started = Date.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const body = response.status === 200 ? await response.json().catch(() => undefined) : undefined;
    return { ms: Date.now() - started, status: response.status, body };
  } catch (err) {
    return { ms: Date.now() - started, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

async function runOnce(runIndex: number): Promise<RunOutcome> {
  const errors: string[] = [];

  const api = await timeFetch(`${API_BASE}/api/battles/${BATTLE_ID}/events`);
  if (api.error) errors.push(`api: ${api.error}`);
  if (api.status !== 200) errors.push(`api: status ${api.status}`);
  const events = (api.body as { events?: unknown[] } | undefined)?.events ?? [];
  if (events.length === 0) errors.push("api: events empty");

  const landing = await timeFetch(`${WEB_BASE}/`);
  if (landing.error) errors.push(`web /: ${landing.error}`);
  if (landing.status !== 200) errors.push(`web /: status ${landing.status}`);

  const live = await timeFetch(`${WEB_BASE}/battle/${BATTLE_ID}?mode=verified_replay`);
  if (live.error) errors.push(`web /battle: ${live.error}`);
  if (live.status !== 200) errors.push(`web /battle: status ${live.status}`);

  const champion = await timeFetch(`${WEB_BASE}/battle/${BATTLE_ID}/champion`);
  if (champion.error) errors.push(`web /champion: ${champion.error}`);
  if (champion.status !== 200) errors.push(`web /champion: status ${champion.status}`);

  return {
    runIndex,
    apiEventsMs: api.ms,
    apiEventsCount: events.length,
    webLandingMs: landing.ms,
    webLiveMs: live.ms,
    webChampionMs: champion.ms,
    errors,
  };
}

function renderReport(outcomes: RunOutcome[]): string {
  const crashed = outcomes.filter((outcome) => outcome.errors.length > 0);
  const emptyEvents = outcomes.filter((outcome) => outcome.apiEventsCount === 0);
  const maxApi = Math.max(...outcomes.map((outcome) => outcome.apiEventsMs));
  const maxWeb = Math.max(...outcomes.map((outcome) => Math.max(outcome.webLandingMs, outcome.webLiveMs, outcome.webChampionMs)));

  const lines: string[] = [];
  lines.push("# Demo Safety Report · v0.5.2 issue #46");
  lines.push("");
  lines.push(`生成时间：${new Date().toISOString()}`);
  lines.push("");
  lines.push("## 指标汇总");
  lines.push("");
  lines.push("| 指标 | 实测 | 阈值 | 结果 |");
  lines.push("|---|---|---|---|");
  lines.push(`| 错误场次 | ${crashed.length}/${TOTAL_RUNS} | 0 | ${crashed.length === 0 ? "✅" : "❌"} |`);
  lines.push(`| 空事件流场次 | ${emptyEvents.length}/${TOTAL_RUNS} | 0 | ${emptyEvents.length === 0 ? "✅" : "❌"} |`);
  lines.push(`| 最慢 API | ${maxApi}ms | < 1000ms | ${maxApi < 1000 ? "✅" : "⚠️"} |`);
  lines.push(`| 最慢 Web | ${maxWeb}ms | < 3000ms | ${maxWeb < 3000 ? "✅" : "⚠️"} |`);
  lines.push("");
  lines.push("## 逐场明细");
  lines.push("");
  lines.push("| # | API ms | 事件数 | / | /battle | /champion | errors |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const outcome of outcomes) {
    lines.push(
      `| ${outcome.runIndex} | ${outcome.apiEventsMs} | ${outcome.apiEventsCount} | ${outcome.webLandingMs} | ${outcome.webLiveMs} | ${outcome.webChampionMs} | ${outcome.errors.join("; ") || "—"} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function main(): Promise<void> {
  console.log(`[demo-safety] starting ${TOTAL_RUNS} runs against ${API_BASE} + ${WEB_BASE}`);
  const outcomes: RunOutcome[] = [];
  for (let i = 0; i < TOTAL_RUNS; i++) {
    const outcome = await runOnce(i + 1);
    outcomes.push(outcome);
    const status = outcome.errors.length === 0 ? "✅" : "❌";
    console.log(
      `[demo-safety] ${i + 1}/${TOTAL_RUNS} ${status} api=${outcome.apiEventsMs}ms events=${outcome.apiEventsCount} landing=${outcome.webLandingMs}ms live=${outcome.webLiveMs}ms champion=${outcome.webChampionMs}ms${outcome.errors.length > 0 ? ` errors=${outcome.errors.join(";")}` : ""}`,
    );
  }

  const report = renderReport(outcomes);
  const reportDir = resolve(process.cwd(), "docs/qa");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = resolve(reportDir, "demo-safety-report-v0.5.2.md");
  writeFileSync(reportPath, report, "utf8");
  console.log(`[demo-safety] report written to ${reportPath}`);

  const crashed = outcomes.filter((outcome) => outcome.errors.length > 0);
  if (crashed.length > 0) {
    console.error(`[demo-safety] BLOCKED: ${crashed.length}/${TOTAL_RUNS} runs had errors`);
    process.exit(2);
  }
  console.log("[demo-safety] all runs clean");
}

main().catch((err) => {
  console.error("[demo-safety] fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
