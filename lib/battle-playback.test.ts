import { describe, expect, it } from "vitest";
import { runDemoBattle } from "@/arena/engine/demo-battle";
import { buildPlaybackBatches, getAcceptedHit, reduceArenaHp } from "./battle-playback";

describe("battle playback", () => {
  it("starts different actors in the same round in one parallel wave", () => {
    const events = runDemoBattle().events;
    const proposalBatch = buildPlaybackBatches(events).find((batch) => batch.round === "proposal_round");
    expect(proposalBatch?.events).toHaveLength(3);
    expect(new Set(proposalBatch?.events.map((event) => event.actorId)).size).toBe(3);
  });

  it("keeps repeated events from the same actor in later waves", () => {
    const events = runDemoBattle().events.filter((event) => event.eventType === "attack_created");
    const duplicated = [...events, { ...events[0], id: `${events[0].id}_again` }];
    const batches = buildPlaybackBatches(duplicated);
    expect(batches).toHaveLength(3);
    for (const batch of batches) {
      const actors = batch.events.map((event) => event.actorId);
      expect(new Set(actors).size).toBe(actors.length);
    }
  });

  it("deducts HP only for accepted defenses", () => {
    const bundle = runDemoBattle();
    const hp = reduceArenaHp(bundle.events, bundle.teams.map((team) => team.id));
    const acceptedTeamIds = new Set(bundle.defenses.filter((defense) => defense.acceptedAttack).map((defense) => defense.teamId));
    for (const team of bundle.teams) {
      expect(hp[team.id] < 100).toBe(acceptedTeamIds.has(team.id));
    }
  });

  it("returns hit metadata only for accepted defenses", () => {
    const events = runDemoBattle().events;
    const accepted = events.find(
      (event) => event.eventType === "defense_created" && (event.rawPayload as { acceptedAttack?: boolean }).acceptedAttack,
    )!;
    const rejected = events.find(
      (event) => event.eventType === "defense_created" && !(event.rawPayload as { acceptedAttack?: boolean }).acceptedAttack,
    )!;
    expect(getAcceptedHit(accepted, events)?.damage).toBeGreaterThan(0);
    expect(getAcceptedHit(rejected, events)).toBeNull();
  });

  it("stably includes the Viral Designer high-severity gotcha in three runs", () => {
    for (let run = 0; run < 3; run += 1) {
      const bundle = runDemoBattle({ battleId: `gotcha_${run}` });
      const gotchaDefense = bundle.defenses.find(
        (defense) => defense.teamId === "viral_designer" && defense.acceptedAttack,
      );
      const gotchaAttack = bundle.attacks.find((attack) => attack.id === gotchaDefense?.attackId);
      expect(gotchaAttack?.severity).toBe("high");
      expect(gotchaDefense?.revision).toContain("concede the core flaw");
    }
  });
});
