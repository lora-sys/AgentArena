import { BattleReplayPlayer, type BattlePlayerTeam } from "./battle-replay-player";
import { getDemoBundle } from "@/lib/demo-data";

export function HomeBattleHero() {
  const bundle = getDemoBundle();
  const proposals = bundle.events.filter((event) => event.eventType === "proposal_created");
  const gotchaAttack = bundle.events.find((event) => {
    if (event.eventType !== "attack_created") return false;
    const payload = event.rawPayload as { severity?: string; targetTeamId?: string };
    return payload.severity === "high" && payload.targetTeamId === "viral_designer";
  });
  const gotchaDefense = gotchaAttack
    ? bundle.events.find((event) => event.eventType === "defense_created" && (event.rawPayload as { attackId?: string }).attackId === gotchaAttack.id)
    : undefined;
  const events = [...proposals, gotchaAttack, gotchaDefense].filter(Boolean) as typeof bundle.events;
  const teams: BattlePlayerTeam[] = bundle.teams.map((team) => ({
    id: team.id,
    name: team.name,
    initials: team.name.split(" ").map((part) => part[0]).join(""),
    color: team.id === "safe_builder" ? "#49D6C8" : team.id === "viral_designer" ? "#F5567E" : "#F2B84B",
    subtitle: team.strategy,
  }));

  return (
    <BattleReplayPlayer
      battleId="demo-highlight"
      title="The comeback that won Battle #42"
      brief="Three teams write at once. One fatal hit changes the plan."
      teams={teams}
      events={events}
      variant="hero"
      loop
      timing={{ characterMs: 6, eventGapMs: 220, roundTransitionMs: 320 }}
    />
  );
}
