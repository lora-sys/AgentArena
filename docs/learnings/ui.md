# UI Learnings

- 2026-07-25 · #37 · unified diff 双栏必须为删除/新增补空行，才能让同一变更块保持视觉行对齐 · 适用于补丁查看 · 参见 `artifact-tab-patch.tsx`
- 2026-07-25 · #37 · 窄屏六列表格应在组件内部横向滚动，不能把溢出传给页面或 Modal · 适用于密集证据表 · 参见 `artifact-detail-tabs.module.css`
- 2026-07-25 · #37 · 证据跳转需要先关闭 Modal，再把历史事件临时置顶、滚动并聚焦，才能让用户看见定位结果 · 适用于跨浮层锚点 · 参见 `ArenaStage.tsx`
- 2026-07-25 · #37 · 历史事件定位必须自动过期，否则会永久占用“最近 5 条”实时流槽位 · 适用于 Live Arena Event Stream · 参见 `findings.md`

- 2026-07-25 · #36 · 黄金 fixture 只提供 unified diff 时，可机械拆分上下文/删除/新增行还原两个已验证片段，不能补写未记录源码 · 适用于版本对比 · 参见 `verified-showcase.ts`
- 2026-07-25 · #36 · Modal 标签状态必须在关闭时重置，否则跨 Agent 重开会隐藏默认版本页 · 适用于所有复用弹窗 · 参见 `artifact-modal.test.tsx`
- 2026-07-25 · #36 · 版本双栏 + Mini App 在 900px 先拆主列、600px 再拆版本列，可保持桌面展示密度并避免移动端横向溢出 · 适用于 Artifact Viewer · 参见 `artifact-tab-versions.module.css`
- 2026-07-25 · #36 · 纯前端演示应把“本地交互、不发外部请求”直接显示并用 fetch spy 固化 · 适用于黑客松可交互样机 · 参见 `mini-app-demo.test.tsx`

- 2026-07-25 · #35 · 回放页面中的 Modal 副作用依赖必须稳定；内联关闭函数会在每批事件重渲染时触发焦点恢复 · 证据：父组件重渲染焦点回归测试 · 来源：`artifact-modal.test.tsx`
- 2026-07-25 · #35 · 桌面居中面板与 375px 底部面板可以共用同一 DOM，只通过断点改变对齐、圆角和标签网格 · 证据：桌面与移动端基线截图 · 来源：`artifact-modal.module.css`
- 2026-07-25 · #35 · 遮罩透明度与 350ms fade-scale 进入动画应进入全局 token，后续 Evidence Lens 可直接复用 · 证据：视觉对照图 · 来源：`tokens.css`

- 2026-07-25 · #34 · `alertdialog` 不能只靠遮罩模拟模态，必须锁定滚动、约束 Tab 焦点并在关闭后恢复焦点 · 适用于所有 Arena 内 Modal · 见 `fatal-takeover.tsx`
- 2026-07-25 · #34 · JS 数字动画应从 CSS motion token 读取时长，确保 reduced-motion 覆盖与视觉时序只有一个真源 · 适用于 HP、Reveal、倒计时 · 见 `tokens.css`
- 2026-07-25 · #34 · 致命攻击的视觉接管可以先用 URL 取证触发器验收，但真实回放接线必须等待共享 `fatal` severity 契约 · 适用于跨工作线 handoff · 见 `findings.md`
- 2026-07-25 · #34 · P2 fixture 合并后必须确认实际消费路径；文件存在不代表 API 已切换数据源 · 适用于 verified replay handoff · 见 `verified-showcase.ts`
- 2026-07-25 · #34 · fatal severity 只能在 HP 实际下降时触发，否则恢复帧会产生 `-0` 二次接管 · 适用于所有伤害/恢复动画 · 见 `hp-bar.test.ts`
- 2026-07-25 · #34 · 375px 下双侧对峙需要压缩大数字并改为纵向布局，桌面三卡横排则应保持首屏可见 Current Attack Focus · 适用于 Live Arena 响应式布局 · 见 `styles.css`
