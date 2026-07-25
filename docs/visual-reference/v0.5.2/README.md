# Agent Arena v0.5.2 视觉基线

拍摄日期：2026-07-25。视口为桌面端 1440×900、移动端 390×844；黄金剧情统一使用 `BA-2026-0024`。

## 13 个验收画面

| # | 状态 | 基线 |
|---|---|---|
| 01a | Landing 桌面端 | [01-landing-desktop.png](01-landing-desktop.png) |
| 01b | Landing 移动端 | [01-landing-mobile.png](01-landing-mobile.png) |
| 02 | Live Arena 常态 | [02-live-arena-normal.png](02-live-arena-normal.png) |
| 03 | 致命攻击接管 | [03-live-fatal-attack.png](03-live-fatal-attack.png) |
| 04a | Evidence Lens 完整证据 | [04-evidence-lens-full.png](04-evidence-lens-full.png) |
| 04b | Evidence Lens 证据不足 | [04-evidence-lens-insufficient.png](04-evidence-lens-insufficient.png) |
| 05a | Artifact 版本对比 | [05-artifact-versions.png](05-artifact-versions.png) |
| 05b | Artifact 补丁差异 | [05-artifact-patch.png](05-artifact-patch.png) |
| 05c | Artifact 测试结果 | [05-artifact-tests.png](05-artifact-tests.png) |
| 06 | Team Passport | [06-passport.png](06-passport.png) |
| 07 | Champion Reveal | [07-champion-reveal.png](07-champion-reveal.png) |
| 08 | Live AI Degraded | [08-live-ai-degraded.png](08-live-ai-degraded.png) |
| 09 | Runtime Mode Badge 三态 | [09-runtime-badge-triple.png](09-runtime-badge-triple.png) |

## 动画证据

- [致命攻击接管](03-live-fatal-attack.mp4)：HP drain 700ms、hit flash 500ms、fatal shake 450ms、floating damage 1100ms。
- [冠军揭晓](07-champion-reveal.mp4)：Victory Reveal 1200ms。
- [实时 AI 降级倒计时](08-live-ai-degraded.mp4)：10 秒倒计时；悬停、键盘焦点和显式按钮均可暂停。

当前 Windows 执行策略阻止 `agent-browser session record` 启动录制子命令，因此静态证据仍全部由 `agent-browser` 拍摄，三段视频由同一 Chromium 页面通过 Playwright `recordVideo` 录制，再以 ffmpeg 转为 H.264 MP4。该限制不影响页面状态与动画时序。

## 设计稿对照与差异说明

| 画面 | 左右对照 | 已解释差异 |
|---|---|---|
| 01 Landing | [对照图](diffs/01-landing-visual-diff.png) | 实现保留全站持久导航，并将主 CTA 与输入错误完整中文化；核心三队同时在场与深色广播构图不变。 |
| 02 Live Arena | [对照图](diffs/02-live-visual-diff.png) | 实现增加可回放事件流和当前攻击焦点，信息密度高于设计稿；三卡主舞台、七段进度与队色关系不变。 |
| 03 Fatal | [对照图](diffs/03-fatal-visual-diff.png) | 实现以全屏接管强化双方头像和 88→38 的 Proof HP 因果；设计稿中的攻击事件 `attack_031` 与关键数值均保留。 |
| 04 Evidence | [对照图](diffs/04-evidence-visual-diff.png) | 实现把六维评分全部放入紧凑网格，而非仅突出单一维度，以便一屏核验总分 87 与完整证据链。 |
| 05 Artifact | [对照图](diffs/05-artifact-visual-diff.png) | 实现使用标签页承载版本、补丁、测试和证据；版本页仍保持双栏代码对比与 Mini App 预览。 |
| 06 Passport | [对照图](diffs/06-passport-visual-diff.png) | 实现将护照置于 Reveal 同页下半屏，并压缩为六维分数、三类特质和可回跳旅程；弱点仍明确展示。 |
| 07 Champion | [对照图](diffs/07-champion-visual-diff.png) | 实现按 Issue 要求放大冠军头像和 87/100，奖杯退为辅助层；1200ms 广播揭晓节奏不变。 |
| 08 Degraded | [对照图](diffs/08-degraded-visual-diff.png) | 实现增加“已安全降级／缺失证据”审计区与立即返回 CTA；不声称未验证事件存在，保留青色警告层级。 |

设计来源：[详细瞬间状态设计稿](../../../ui/详细瞬间状态设计稿.png) 与 [设计总览](../../../ui/design.png)。对照图左侧为设计稿裁剪，右侧为实际浏览器截图；尺寸差异通过等比例展示解释，不作为布局偏差计算。

## 复现命令

```powershell
pnpm dev
agent-browser session start --name baseline-45
agent-browser --session baseline-45 set viewport 1440 900
agent-browser --session baseline-45 open "http://localhost:5188/battle/BA-2026-0024?mode=verified_replay"
agent-browser --session baseline-45 screenshot "docs/visual-reference/v0.5.2/02-live-arena-normal.png"
```

移动端基线将视口切换为 `390 844`；Modal 基线在对应队伍卡片打开“证据”或“作品”后拍摄。Fatal 使用 `fatal=1` 的取证触发器；合并前仍由真实 fixture 的 `fatal` severity 契约覆盖。
