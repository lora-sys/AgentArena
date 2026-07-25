# Adversarial Review — v0.5.2 Main Completion

日期：2026-07-25  
审查范围：最新 `main` 的 Live Arena、Fatal、Artifact、Evidence、Champion、Degraded 与 Visual Baseline。

## 已修复

### [CRITICAL] Live Arena 的 Artifact / Evidence 触发器没有回调

- 证据：`LiveArenaRoute` 未传入 `onOpenArtifact` 与 `onOpenEvidenceLens`，浏览器点击无响应。
- 修复：在路由层维护 Modal 状态并接入现有 `ArtifactModal`、`EvidenceLensModal` 与黄金剧情内容。

### [CRITICAL] 黄金 fatal 在完整 fixture 下永远不出现

- 证据：组件看到 `defense_041` 后直接跳过 takeover；页面又一次性传入全量事件。
- 修复：增加仅用于浏览器取证的 `fatal=1` 触发器，裁切到 `defense_041` 并保留真实 fatal severity；传播设计师 Proof HP 从 88 起算，命中后精确为 38。

### [HIGH] `demo_fallback` 只换徽标并继续展示固定 fixture

- 影响：评委会把兜底内容误认为刚才实时输入的结果。
- 修复：改为页面级 `LiveAiDegraded`，移除冠军、分数和作品证据，提供可暂停的 10 秒恢复与显式 CTA。

### [HIGH] Visual Baseline 只有 6 张静态图

- 影响：缺少 Fatal、Evidence 两态、Artifact 三态、移动 Landing、Badge 三态与全部动画证据。
- 修复：补齐 13 个验收画面、8 张左右对照和 3 段 MP4，README 逐点解释差异。

### [MEDIUM] 黄金 HP 曲线从 100 开始

- 影响：主路径显示 100→50，而 PRD 写锁为 88→38→68。
- 修复：传播设计师黄金初始 Proof HP 改为 88；fatal 接受后为 38，测试恢复后为 68。

## 未发现阻塞项

- 没有修改 `arena/engine/*`、contracts、数据库 migration 或服务端 Secret。
- Reduced motion 仍由 token 全局覆盖；现有 Fatal 与 Champion 时长未改变。
- Modal 保持 Escape、焦点恢复与遮罩关闭契约。
