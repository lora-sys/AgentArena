# UI Learnings

- 2026-07-25 · #34 · `alertdialog` 不能只靠遮罩模拟模态，必须锁定滚动、约束 Tab 焦点并在关闭后恢复焦点 · 适用于所有 Arena 内 Modal · 见 `fatal-takeover.tsx`
- 2026-07-25 · #34 · JS 数字动画应从 CSS motion token 读取时长，确保 reduced-motion 覆盖与视觉时序只有一个真源 · 适用于 HP、Reveal、倒计时 · 见 `tokens.css`
- 2026-07-25 · #34 · 致命攻击的视觉接管可以先用 URL 取证触发器验收，但真实回放接线必须等待共享 `fatal` severity 契约 · 适用于跨工作线 handoff · 见 `findings.md`
