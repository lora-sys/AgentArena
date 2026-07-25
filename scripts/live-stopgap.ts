/**
 * #47 止损测试：20 场真实 StepFun live_runtime 全链路跑测。
 *
 * Run:
 *   pnpm tsx scripts/live-stopgap.ts
 *
 * 写死指标（docs/DEV-STANDARDS.md §8）：
 *   - 完成率 = 包含 champion_selected 事件的场次数 / 20，≥ 70% 为通过
 *   - Schema success = 无 schema_repair 失败场次数 / 20，≥ 95%
 *   - 首事件 P95 ≤ 10s
 *   - 总时 P95 ≤ 90s
 *   - 任一项未达标 → 报告顶部标 STOPLOSS TRIGGERED
 *
 * 报告写入 docs/qa/live-stopgap-report-v0.5.2.md。
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { runLiveBattleFromPayload } from "../lib/runtime/runLiveBattleFromPayload";
import type { BattleEvent } from "../packages/contracts/src";

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

const TOTAL_RUNS = 20;
const PASS_COMPLETION = 0.7;
const PASS_SCHEMA = 0.95;
const PASS_FIRST_EVENT_P95_MS = 10_000;
const PASS_TOTAL_P95_MS = 90_000;

const IDEAS = [
  "帮助大学生准备考试的 AI 学习助手",
  "为独立开发者生成周报的工具",
  "给小型咖啡馆做库存盘点的助手",
  "为新手父母提供婴儿睡眠指导的 AI",
  "为开源维护者生成 release notes",
  "给外语学习者定制每日口语练习",
  "为远程团队设计异步站立会议摘要",
  "为自由插画师管理客户反馈",
  "给大学生整理课程笔记的知识图谱",
  "为跑步爱好者生成动态训练计划",
  "帮小企业主写每日社交媒体文案",
  "给二手书交易平台生成个性化推荐",
  "为家庭花园提供植物养护提醒",
  "给产品经理自动生成用户访谈提纲",
  "为老年人提供语音记账助手",
  "帮创作者追踪多平台粉丝数据",
  "为儿童设计交互式自然拼读游戏",
  "给远程面试官生成结构化评估卡",
  "为素食主义者定制每周菜谱",
  "帮初创团队生成投资 pitch 大纲",
];

type RunOutcome = {
  runIndex: number;
  idea: string;
  firstEventMs: number | null;
  totalMs: number;
  eventCount: number;
  hasChampionSelected: boolean;
  hasSchemaRepairFailure: boolean;
  error?: string;
};

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

async function runOnce(runIndex: number, idea: string): Promise<RunOutcome> {
  const battleId = `stopgap_${runIndex}_${Date.now().toString(36)}`;
  const startedAt = Date.now();
  let firstEventMs: number | null = null;
  let eventCount = 0;
  let hasChampionSelected = false;
  let hasSchemaRepairFailure = false;
  let error: string | undefined;

  try {
    for await (const event of runLiveBattleFromPayload({ battleId, idea }) as AsyncGenerator<BattleEvent>) {
      if (firstEventMs === null) firstEventMs = Date.now() - startedAt;
      eventCount += 1;
      if (event.eventType === "champion_selected") hasChampionSelected = true;
      if (event.eventType === "error") hasSchemaRepairFailure = true;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return {
    runIndex,
    idea,
    firstEventMs,
    totalMs: Date.now() - startedAt,
    eventCount,
    hasChampionSelected,
    hasSchemaRepairFailure,
    error,
  };
}

function renderReport(outcomes: RunOutcome[]): string {
  const completed = outcomes.filter((outcome) => outcome.hasChampionSelected).length;
  const schemaOk = outcomes.filter((outcome) => !outcome.hasSchemaRepairFailure && !outcome.error).length;
  const completionRate = completed / TOTAL_RUNS;
  const schemaRate = schemaOk / TOTAL_RUNS;
  const firstEventTimes = outcomes.map((outcome) => outcome.firstEventMs).filter((v): v is number => v !== null);
  const totalTimes = outcomes.map((outcome) => outcome.totalMs);
  const firstP95 = percentile(firstEventTimes, 95);
  const totalP95 = percentile(totalTimes, 95);

  const passed =
    completionRate >= PASS_COMPLETION &&
    schemaRate >= PASS_SCHEMA &&
    firstP95 <= PASS_FIRST_EVENT_P95_MS &&
    totalP95 <= PASS_TOTAL_P95_MS;

  const lines: string[] = [];
  lines.push("# Live Stopgap Report · v0.5.2 issue #47");
  lines.push("");
  lines.push(`生成时间：${new Date().toISOString()}`);
  lines.push("");
  if (!passed) {
    lines.push("## 🛑 STOPLOSS TRIGGERED");
    lines.push("");
    lines.push("任一指标未达标，按 docs/DEV-STANDARDS.md §9 止损条款：D 线降级 P2，剩余时间 P1 全力打磨 A/C 动效。双人拍板后生效。");
    lines.push("");
  } else {
    lines.push("## ✅ 全部指标达标");
    lines.push("");
  }
  lines.push("## 指标汇总");
  lines.push("");
  lines.push("| 指标 | 实测 | 阈值 | 结果 |");
  lines.push("|---|---|---|---|");
  lines.push(`| 完成率 | ${(completionRate * 100).toFixed(1)}% (${completed}/${TOTAL_RUNS}) | ≥ ${PASS_COMPLETION * 100}% | ${completionRate >= PASS_COMPLETION ? "✅" : "❌"} |`);
  lines.push(`| Schema success | ${(schemaRate * 100).toFixed(1)}% (${schemaOk}/${TOTAL_RUNS}) | ≥ ${PASS_SCHEMA * 100}% | ${schemaRate >= PASS_SCHEMA ? "✅" : "❌"} |`);
  lines.push(`| 首事件 P95 | ${firstP95}ms | ≤ ${PASS_FIRST_EVENT_P95_MS}ms | ${firstP95 <= PASS_FIRST_EVENT_P95_MS ? "✅" : "❌"} |`);
  lines.push(`| 总时 P95 | ${totalP95}ms | ≤ ${PASS_TOTAL_P95_MS}ms | ${totalP95 <= PASS_TOTAL_P95_MS ? "✅" : "❌"} |`);
  lines.push("");
  lines.push("## 逐场明细");
  lines.push("");
  lines.push("| # | idea | 首事件 ms | 总时 ms | 事件数 | 冠军 | schema | 错误 |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const outcome of outcomes) {
    const err = outcome.error ? outcome.error.replace(/\|/g, "\\|").slice(0, 60) : "—";
    lines.push(
      `| ${outcome.runIndex} | ${outcome.idea.slice(0, 20)}… | ${outcome.firstEventMs ?? "—"} | ${outcome.totalMs} | ${outcome.eventCount} | ${outcome.hasChampionSelected ? "✅" : "❌"} | ${outcome.hasSchemaRepairFailure ? "❌" : "✅"} | ${err} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function main(): Promise<void> {
  console.log(`[live-stopgap] starting ${TOTAL_RUNS} runs`);
  const outcomes: RunOutcome[] = [];
  for (let i = 0; i < TOTAL_RUNS; i++) {
    const idea = IDEAS[i % IDEAS.length];
    console.log(`[live-stopgap] run ${i + 1}/${TOTAL_RUNS}: ${idea.slice(0, 30)}…`);
    const outcome = await runOnce(i + 1, idea);
    outcomes.push(outcome);
    console.log(
      `[live-stopgap]   → totalMs=${outcome.totalMs} firstEventMs=${outcome.firstEventMs ?? "—"} events=${outcome.eventCount} champion=${outcome.hasChampionSelected ? "✅" : "❌"}${outcome.error ? ` error=${outcome.error.slice(0, 60)}` : ""}`,
    );
  }

  const report = renderReport(outcomes);
  const reportDir = resolve(process.cwd(), "docs/qa");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = resolve(reportDir, "live-stopgap-report-v0.5.2.md");
  writeFileSync(reportPath, report, "utf8");
  console.log(`[live-stopgap] report written to ${reportPath}`);

  const completed = outcomes.filter((outcome) => outcome.hasChampionSelected).length;
  const completionRate = completed / TOTAL_RUNS;
  if (completionRate < PASS_COMPLETION) {
    console.error(`[live-stopgap] STOPLOSS TRIGGERED: completion ${(completionRate * 100).toFixed(1)}% < ${PASS_COMPLETION * 100}%`);
    process.exit(2);
  }
  console.log("[live-stopgap] all gates passed");
}

main().catch((err) => {
  console.error("[live-stopgap] fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
