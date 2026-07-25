# Agent Arena v0.5.2 视觉基线

拍摄日期：2026-07-25。桌面视口 1440×900，移动视口 390×844；全部核心剧情使用 `BA-2026-0024`。

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

`02-live-arena-bottom.png` 是主线此前保留的长页下半屏补充证据，不计入 13 个验收点。

## 动画证据

- [Fatal 接管](03-live-fatal-attack.mp4)：88→38，HP drain 700ms、hit flash 500ms、fatal shake 450ms、floating damage 1100ms。
- [Champion Reveal](07-champion-reveal.mp4)：1200ms。
- [Live AI Degraded](08-live-ai-degraded.mp4)：10 秒自动恢复，悬停、键盘焦点和显式按钮可暂停。

Windows 执行策略阻止 `agent-browser session record` 启动录制子命令。静态画面仍全部由 `agent-browser` 拍摄；视频使用同一 Chromium 页面通过 Playwright `recordVideo` 录制，并以 ffmpeg 转成 H.264 MP4。

## 左右对照与差异说明

| 画面 | 对照 | 差异解释 |
|---|---|---|
| 01 Landing | [左右对照](diffs/01-landing-visual-diff.png) | 实现保留持久全站导航与 Idea 输入；三队同时在场、深色广播构图和粉色主 CTA 不变。 |
| 02 Live | [左右对照](diffs/02-live-visual-diff.png) | 实现增加事件流与当前攻击焦点，信息密度高于设计稿；三卡、七段进度和队色关系不变。 |
| 03 Fatal | [左右对照](diffs/03-fatal-visual-diff.png) | 以整屏暗场强化 88→38；攻击 `attack_031`、-50 和双方身份均与黄金剧情一致。 |
| 04 Evidence | [左右对照](diffs/04-evidence-visual-diff.png) | 实现一屏展示六维评分和四节点证据链，便于核验总分 87。 |
| 05 Artifact | [左右对照](diffs/05-artifact-visual-diff.png) | 采用四标签 Modal；版本页保留双栏代码和 Mini App，补丁与测试分别独立取证。 |
| 06 Passport | [左右对照](diffs/06-passport-visual-diff.png) | 同页下半屏呈现六维、优势、弱点、建议与旅程，未隐藏负面信息。 |
| 07 Champion | [左右对照](diffs/07-champion-visual-diff.png) | 实现把奖杯和 87/100 作为情绪焦点，并保留 1200ms Reveal。 |
| 08 Degraded | [左右对照](diffs/08-degraded-visual-diff.png) | 新增安全降级／缺失证据审计区和恢复 CTA；不会展示固定 fixture 的战斗结果。 |

设计来源：[详细瞬间状态设计稿](../../../ui/详细瞬间状态设计稿.png) 与 [设计总览](../../../ui/design.png)。对照图左侧为设计稿裁剪，右侧为实际浏览器画面。

## 复现

```powershell
pnpm dev
agent-browser session start --name pr-45
agent-browser --session pr-45 set viewport 1440 900
agent-browser --session pr-45 open "http://localhost:5188/battle/BA-2026-0024?mode=verified_replay"
agent-browser --session pr-45 screenshot "docs/visual-reference/v0.5.2/02-live-arena-normal.png"
```

Fatal 使用只用于取证的 `fatal=1` 查询参数；页面仍从真实黄金 fixture 的 `fatal` severity 和 `defense_041` 计算 88→38。Evidence 完整态使用 verified replay，证据不足态使用 live runtime。
