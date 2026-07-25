import type { BattleEvent } from "@agent-arena/contracts";
import { liveArenaZh as zh } from "../i18n/zh";
import { TypewriterText } from "./typewriter-text";

/**
 * ArenaHost — 主持人解说（Issue #32 / 计划 #11）
 *
 * 头像 + 音频波形装饰动画（非真实 TTS）+ 解说文案随 Round 更新。
 * 权威口径：`ui/Agent_Arena_v0.5.2_最终交付包.md` §140 —— 波形为装饰性动画即可，不接真实语音合成。
 * 文案走 zh.ts（中文优先）；解说文本用 TypewriterText 逐字呈现。
 *
 * 供 ArenaStage 消费：
 * - `events`：当前批次事件（用于选取解说文案）。
 * - `active`：是否处于活跃回合（驱动波形动画）。
 */
export interface ArenaHostProps {
  events: readonly BattleEvent[];
  active?: boolean;
}

/** 依据最新事件选取中文解说文案（全部走 zh.ts.host） */
export function commentaryFor(events: readonly BattleEvent[]): string {
  const event = events[events.length - 1];
  if (!event) return zh.host.standby;
  switch (event.eventType) {
    case "proposal_created": return zh.host.proposal;
    case "attack_created": return zh.host.attack(event.title);
    case "defense_created": return event.content;
    case "score_created": return zh.host.scoring;
    case "champion_selected": return zh.host.champion(event.title);
    default: return event.content;
  }
}

const WAVE_BARS = 7;

export function ArenaHost({ events, active = true }: ArenaHostProps) {
  const text = commentaryFor(events);
  return (
    <div className={`arena-host ${active ? "speaking" : ""}`}>
      <div className="arena-host-avatar" aria-hidden="true">
        <span className="arena-host-ring" />
        <b>{zh.host.name.slice(0, 1)}</b>
      </div>
      <div className="arena-host-body">
        <header>
          <b>{zh.host.label}</b>
          <span className="arena-host-wave" aria-hidden="true">
            {Array.from({ length: WAVE_BARS }, (_, i) => (
              <i key={i} style={{ animationDelay: `${i * 90}ms` }} />
            ))}
          </span>
        </header>
        <TypewriterText as="p" key={text} text={text} active={active} msPerChar={18} />
      </div>
    </div>
  );
}
