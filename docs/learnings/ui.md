# UI Learnings

- 2026-07-25 · #35 · 回放页面中的 Modal 副作用依赖必须稳定；内联关闭函数会在每批事件重渲染时触发焦点恢复 · 证据：父组件重渲染焦点回归测试 · 来源：`artifact-modal.test.tsx`
- 2026-07-25 · #35 · 桌面居中面板与 375px 底部面板可以共用同一 DOM，只通过断点改变对齐、圆角和标签网格 · 证据：桌面与移动端基线截图 · 来源：`artifact-modal.module.css`
- 2026-07-25 · #35 · 遮罩透明度与 350ms fade-scale 进入动画应进入全局 token，后续 Evidence Lens 可直接复用 · 证据：视觉对照图 · 来源：`tokens.css`

- 2026-07-25 · #34 · `alertdialog` 不能只靠遮罩模拟模态，必须锁定滚动、约束 Tab 焦点并在关闭后恢复焦点 · 适用于所有 Arena 内 Modal · 见 `fatal-takeover.tsx`
- 2026-07-25 · #34 · JS 数字动画应从 CSS motion token 读取时长，确保 reduced-motion 覆盖与视觉时序只有一个真源 · 适用于 HP、Reveal、倒计时 · 见 `tokens.css`
- 2026-07-25 · #34 · 致命攻击的视觉接管可以先用 URL 取证触发器验收，但真实回放接线必须等待共享 `fatal` severity 契约 · 适用于跨工作线 handoff · 见 `findings.md`
- 2026-07-25 · #34 · P2 fixture 合并后必须确认实际消费路径；文件存在不代表 API 已切换数据源 · 适用于 verified replay handoff · 见 `verified-showcase.ts`
- 2026-07-25 · #34 · fatal severity 只能在 HP 实际下降时触发，否则恢复帧会产生 `-0` 二次接管 · 适用于所有伤害/恢复动画 · 见 `hp-bar.test.ts`
- 2026-07-25 · #34 · 375px 下双侧对峙需要压缩大数字并改为纵向布局，桌面三卡横排则应保持首屏可见 Current Attack Focus · 适用于 Live Arena 响应式布局 · 见 `styles.css`
