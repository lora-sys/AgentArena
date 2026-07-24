# 浏览器自动化取证协议（Browser Verification Protocol）

> 每个 PR 合并前必做。Reviewer 拒绝任何**没有 agent-browser 截图**或**没有并排视觉比对图**的 UI PR。

---

## 0. 前置一次性安装

```bash
which agent-browser || npm i -g agent-browser && agent-browser install
agent-browser skills get agent-browser   # 加载最新的 CLI 指令，不要凭记忆写命令
```

> `agent-browser` 是 native Rust CLI，用 CDP 直连 Chrome/Chromium。文档见 `~/.claude/skills/agent-browser/SKILL.md`。
> **不要用** Playwright、Puppeteer 或浏览器 MCP 替代 —— 全项目统一。

---

## 1. 每个 PR 的固定动作

```bash
# 1. 启动开发环境
pnpm dev   # web:5188 + api:8787

# 2. 开一个会话（会话名 = PR 编号，方便回查）
agent-browser session start --name "pr-{issue-number}"

# 3. 导航到本 PR 影响的路由
agent-browser navigate http://localhost:5188/battle/BA-2026-0024?mode=verified_replay

# 4. 快照
agent-browser snapshot --output screenshots/pr-{issue-number}-{state}.png

# 5. 动画类必录屏（HpBar 掉血 / 致命攻击接管 / Champion Reveal / Modal 展开 / TypewriterText）
agent-browser session record --output screenshots/pr-{issue-number}.mp4

# 6. 会话结束
agent-browser session stop
```

截图与录屏统一放 `screenshots/pr-{issue-number}-*.png|mp4`（`.gitignore` 已忽略，改为附到 PR 描述里）。

---

## 2. 视觉比对（Visual Diff · 硬门）

每个 UI issue 的 PR body 必须贴**并排图**：

```
左：ui/详细瞬间状态设计稿.png 的对应画面裁剪
右：screenshots/pr-{issue-number}-{state}.png
下方：差异点列表 + 每条差异的解释
```

### 差异容忍度
- **主色卡准**：与 tokens.css 的 `#0A0D14 / #49D6C8 / #F5567E / #F2B84B / #FF4D4D / #E9C468` 亮度差 ≤ 5。
- **排版结构**：网格、卡片位置、图标位置必须一致。差异必须在 PR body 里显式解释。
- **字体族**：Archivo Black（Heading）· Inter Regular（Body）· IBM Plex Mono（数字/代码）。
- **动画时长**：精确匹配 `docs/DEV-STANDARDS.md §7`。

### Reviewer 检查
Reviewer 用 `agentarena-visual-baseline` skill 做像素 diff：
```bash
# Reviewer 侧
Skill: agentarena-visual-baseline
```
> 5% pixel diff 且未解释 → **request-changes**。

---

## 3. 每个 Issue 的截图清单（Screenshot Manifest）

对应 UI Mapping v0.5.1 §15 的验收截图清单。

| Issue | 路由 | 必交截图 | 录屏 |
|---|---|---|---|
| #05 tokens + 字体 | 任意 | `design-tokens.png`（DevTools CSS 变量列表 + Font 面板） | — |
| #08 HpBar | `/battle/BA-2026-0024?mode=verified_replay` | `hp-bar-normal.png` · `hp-bar-fatal.png` | ✅ 700ms 掉血 + 450ms 震动 |
| #09 TypewriterText | 任意 | `typewriter-mid.png` | ✅ |
| #10 RoundBanner | 同上 | `round-progress-7stage.png` | ✅ 350ms 转场 |
| #11 ArenaHost | 同上 | `arena-host-commentary.png` | — |
| #12 RuntimeModeBadge | Landing + Live + Fallback | `runtime-mode-badge-all.png` | — |
| #13 Live Arena + 致命攻击 | `/battle/BA-2026-0024?mode=verified_replay` | `live-arena-normal.png` · `live-fatal-attack.png` | ✅ 完整致命攻击接管 |
| #14 Artifact Modal | Live Arena 内点作品入口 | `artifact-modal-open.png` | — |
| #15 版本对比 | Modal | `artifact-viewer-versions.png` | — |
| #16 Patch Diff + Test | Modal | `artifact-viewer-patch-diff.png` · `artifact-viewer-test-result.png` | — |
| #17 Live 降级卡 | `?mode=live_runtime` + 空 fixture | `artifact-viewer-live-degraded.png` | — |
| #18 Evidence Lens Modal | Live Arena 点评分维度 | `evidence-lens-full.png` · `evidence-lens-insufficient.png` | — |
| #19 Champion 页 | `/battle/BA-2026-0024/champion` | `champion-reveal.png` · `passport.png` | ✅ 1200ms Victory Reveal |
| #20 Mini Passport | `/battle/{live-id}/champion` 未完成 | `mini-passport.png` | — |
| #21 StepFun health | 后端 | `stepfun-health.png`（终端 curl 输出） | — |
| #22 SSE 流 | `/api/battles/{id}/events` | `live-runtime-stream.png` | — |
| #23 POST /battles + 降级 | Landing 输入 Idea | `live-idea-input.png` · `live-runtime.png` · `live-ai-degraded.png` · `fallback.png` | ✅ 10s 倒计时 |
| #24 Visual Baseline | 全部 | 13 张验收截图 | ✅ 完整 verified_replay 全链路录屏 |
| #25 Demo Safety 20 连测 | 终端 | `demo-safety-log.png` | — |
| #26 止损测试 20 场 | 终端 | `stopgap-test-report.png` | — |

---

## 4. 全链路 Smoke Gate（Pitch 前必过 3 次）

### 4.1 verified_replay（Demo 演示模式 · Pitch 主路径）
```
1. 打开 http://localhost:5188/
2. 点"观看 90 秒已验证演示"
3. 到 Live Arena → 观察 Round 进度条七段依次点亮
4. 观察致命攻击接管：红警条 + HP 88→38 大字 + Evidence Lens 自动展开
5. 关闭 Evidence Lens → 点某个 Agent 卡的"作品入口" → Artifact Viewer Modal 打开
6. 切换 4 个 tab（版本对比 / Patch Diff / 测试结果 / 关联证据）
7. 关闭 Modal → 等剧情走完 → 自动跳 /battle/BA-2026-0024/champion
8. 观察 Champion Reveal 1200ms 揭晓 + Passport 六维展开
```
**录像**：全程录屏，作为 #24 Visual Baseline 的核心产出。

### 4.2 live_runtime（StepFun）
```
1. 确保 STEPFUN_API_KEY 已配置、AGENT_ARENA_LIVE_BATTLE_ENABLED=true
2. Landing → 输入 Idea "帮助大学生准备考试"
3. 点"实时开战 Beta"
4. Runtime Mode Badge 应显示"实时 AI 竞技"
5. 观察至少 4 段真实 Round 生成（Proposal / Attack / Defense / Judge）
6. 首 event 应在 10s 内到达；总时应在 90s 内完成
7. 完成 → 跳 Champion 页（或 Mini Passport 若未完成）
```

### 4.3 demo_fallback（兜底）
```
1. 清空 STEPFUN_API_KEY
2. Landing → 输入 Idea → 点"实时开战 Beta"
3. 应在 10s 内自动切"演示兜底"页
4. 页面明确标注"当前演示不对应刚才输入的创意"
5. 10s 倒计时后自动切 verified_replay
6. hover 或键盘操作应暂停倒计时
```

---

## 5. 全绿 Gate

3 条全链路 smoke 走通后：
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e
```
全绿方可进入 Pitch 彩排。

---

## 6. 常见错误自查

- ❌ 用 Chrome 直接手动截图 → 必须走 agent-browser 才有可复现的会话。
- ❌ 只贴实现截图不贴设计稿裁剪 → 无法判断视觉还原度。
- ❌ 静态截图声称测过动画 → 动画类必录屏。
- ❌ 用 `localhost:8787` 截图（那是 API） → 前端在 `5188`。
- ❌ 截图里露出中文字体降级为宋体 → 检查 `tokens.css` 的 `font-family` 与浏览器缓存。
