import styles from "./battle-replay-player.module.css";

const ROUND_NAMES: Record<string, string> = {
  briefing: "BRIEFING",
  team_generation: "TEAM ENTRANCE",
  proposal_round: "PROPOSAL",
  cross_attack_round: "CROSS ATTACK",
  defense_round: "DEFENSE",
  judging_round: "JUDGING",
  artifact_generation: "ARTIFACTS",
  replay_generation: "PASSPORT SNAPSHOT",
};

const ROUND_NUMBERS: Record<string, string> = {
  briefing: "0",
  team_generation: "0",
  proposal_round: "1",
  cross_attack_round: "2",
  defense_round: "3",
  judging_round: "4",
  artifact_generation: "5",
  replay_generation: "5",
};

export function RoundBanner({ round, index }: { round: string; index: number }) {
  return (
    <div key={round} className={styles.roundBanner} role="status" aria-live="polite">
      <span className={styles.roundRule} />
      <span className={styles.roundIndex}>ROUND {ROUND_NUMBERS[round] ?? index + 1}</span>
      <strong>{ROUND_NAMES[round] ?? round.replaceAll("_", " ").toUpperCase()}</strong>
      <span className={styles.roundRule} />
    </div>
  );
}
