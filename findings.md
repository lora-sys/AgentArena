# Adversarial Review Findings

Date: 2026-07-26
Scope: v0.5.2 runtime, persistence, evidence, i18n, UI and end-to-end audit

## Unresolved findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0

## Resolved during final audit

- Live Artifact、Evidence、Champion 和 Passport 全部改为读取当前 `live_evt_*`，不再混入黄金剧情数据。
- Judge 与 Artifact Writer 输入绑定提案、攻击、防守、评分及来源事件；每条 Score 绑定至少一个 evidence event。
- StepFun 使用真实总超时与有限 schema repair；provider 分片仅上报累计字符数，不泄露或持久化原始模型内容。
- 快速模型调用的完成事件也保存最终 `streamChars`，并由无心跳完成路径的单元测试覆盖。
- Proposal、Attack、Defense、Judge、Artifact 等待阶段每 2.5 秒持久化工作流活动，SSE、刷新恢复和页面卡片读取同一事件数据。
- Fatal 接管只由 fatal event 启动一次，不再被后续 SSE 反复延长。
- 所有新增用户可见中文字符串进入 `t()` 字典；Evidence Lens 增加焦点陷阱。
- Battle 存储路径改为模块相对路径；代理 IP 仅在 `TRUST_PROXY_HEADERS=true` 时信任。
- Mini App 绑定本场冠军作品并生成本场验收步骤；Idea 从 `brief_created.rawPayload.idea` 恢复。
- 新增成功 `live_runtime` E2E，覆盖 SSE 完成、刷新恢复、Artifact、Evidence、Champion 与 Passport。

## Verification

- `pnpm typecheck`: passed
- `pnpm lint`: passed
- `pnpm test`: 357/357 passed
- `pnpm e2e`: 12 passed, 2 configured skips
- `pnpm build`: passed
- Three real StepFun battles completed. Final battle `live_ms0lmp9n_kv02d1` persisted 142 events, exposed safe model-chunk progress, restored after refresh, and completed in about 101 seconds.

## Recommendation

Ready for product review. Keep Web/API running for manual inspection and use `docs/qa/visual-baselines/` as the audit record.

## 2026-07-26 Replay and per-team artifact follow-up

- Champion replay now loads persisted events with `replay=1` and starts from the first event instead of rendering the completed result.
- Artifact, patch, test, evidence, score, and passport projections are filtered by visible event cursor and producing team.
- The three Agent cards now expose distinct, team-owned workspaces; only the actual winner receives the champion artifact treatment.
- Rules and Share controls are functional, and card actions have unique accessible names.
- Adversarial re-review closed all five previously reported High/Medium findings; no blocking finding remains.
- Remaining non-blocking coverage notes: passport journey filtering lacks a dedicated unit test, and clipboard rejection has no explicit error toast.
