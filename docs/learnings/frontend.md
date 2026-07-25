# Frontend learnings

## 2026-07-22 — Battle Arena visual playback

- The current SSE endpoint transports a completed event bundle; presentation timing must therefore be owned by a deterministic client playback queue.
- Grouping events by contiguous round and actor occurrence produces the desired concurrency: different teams reveal together, while repeated actions by one actor retain order.
- HP is safest as an event-derived projection. Settling accepted defenses only after their text reveal keeps animation timing separate from the authoritative Battle Engine.
- The static demo and dynamic route can share one player when data acquisition remains outside the player; static bundles and SSE arrays become equivalent inputs.
- 2026-07-25 · main completion · 页面按钮存在不等于产品闭环成立，路由层必须实测回调是否真正打开 Modal · 适用于所有容器／展示组件边界
- 2026-07-25 · main completion · 完整 fixture 会让“尚未防守”的动画条件永远为假，确定性取证需裁切真实事件而不是伪造 severity · 适用于回放中间态
- 2026-07-25 · main completion · 降级态只换徽标会泄漏固定剧情，必须独占内容区并移除不可验证结果 · 适用于双运行时模式隔离
- 2026-07-25 · main completion · Issue 已关闭不能证明验收素材完整，Visual Baseline 必须按截图点与视频点逐项清点 · 适用于发布审计
