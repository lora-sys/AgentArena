"use client";

import { useState } from "react";
import { ArrowRight, Swords } from "lucide-react";

type AttackEventLike = {
  id: string;
  actorId?: string;
  targetId?: string;
  content?: string;
  title?: string;
  round?: string;
};

type AttackMatrixProps = {
  attacks: AttackEventLike[];
};

const ATTACKER_TEAMS = [
  { id: "safe_builder", name: "Safe Builder", color: "text-team-safe", border: "border-team-safe", bg: "bg-team-safe-08" },
  { id: "viral_designer", name: "Viral Designer", color: "text-team-viral", border: "border-team-viral", bg: "bg-team-viral-08" },
  { id: "infra_hacker", name: "Infra Hacker", color: "text-team-infra", border: "border-team-infra", bg: "bg-team-infra-08" },
] as const;

const normalizeId = (id: string): string => id.replace(/[_-]/g, "");

const cellAttacksFor = (attacks: AttackEventLike[], from: string, to: string): AttackEventLike[] =>
  attacks.filter(
    (e) =>
      normalizeId(e.actorId ?? "") === normalizeId(from) &&
      normalizeId(e.targetId ?? "") === normalizeId(to),
  );

const cellKey = (from: string, to: string): string => `${from}->${to}`;

export function AttackMatrix({ attacks }: AttackMatrixProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const toggleCell = (key: string) => {
    setExpandedCell((prev) => (prev === key ? null : key));
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCell(key);
    }
  };

  if (attacks.length === 0) {
    return <p className="muted">Awaiting attacks...</p>;
  }

  return (
    <div className="attack-matrix-wrapper">
      <div
        className="attack-matrix"
        role="grid"
        aria-label="Cross attack matrix: rows are attacker teams, columns are target teams"
      >
        {/* Header row */}
        <div className="attack-matrix-row attack-matrix-header-row" role="row">
          <div className="attack-matrix-corner" aria-hidden="true" />
          {ATTACKER_TEAMS.map((target) => (
            <div
              key={`header-${target.id}`}
              className={`attack-matrix-col-header ${target.color}`}
              role="columnheader"
            >
              <span aria-hidden="true">&rarr;</span>
              {target.name}
            </div>
          ))}
        </div>

        {/* Data rows: one row per attacker */}
        {ATTACKER_TEAMS.map((attacker) => {
          const rowCells = ATTACKER_TEAMS.map((target) => {
            if (attacker.id === target.id) {
              return (
                <div
                  key={`self-${attacker.id}-${target.id}`}
                  className="attack-matrix-cell attack-matrix-cell-self"
                  role="gridcell"
                  aria-hidden="true"
                />
              );
            }

            const key = cellKey(attacker.id, target.id);
            const cellAttackList = cellAttacksFor(attacks, attacker.id, target.id);
            const count = cellAttackList.length;
            const isExpanded = expandedCell === key;
            const regionId = `attack-matrix-region-${key}`;

            return (
              <div
                key={key}
                className={`attack-matrix-cell-wrap ${count > 0 ? "has-attacks" : "empty"} ${isExpanded ? "expanded" : ""}`}
                role="gridcell"
              >
                {count > 0 ? (
                  <>
                    <button
                      type="button"
                      className={`attack-matrix-cell ${target.border} ${isExpanded ? "expanded" : ""}`}
                      aria-label={`${count} attack${count === 1 ? "" : "s"} from ${attacker.name} to ${target.name}`}
                      aria-expanded={isExpanded}
                      aria-controls={regionId}
                      onClick={() => toggleCell(key)}
                      onKeyDown={(e) => handleKeyDown(e, key)}
                    >
                      <span className={`attack-matrix-badge ${target.bg} ${target.color}`}>
                        <Swords size={12} aria-hidden="true" />
                        <strong>{count}</strong>
                      </span>
                    </button>

                    {isExpanded ? (
                      <div
                        id={regionId}
                        className="attack-matrix-expanded"
                        role="region"
                        aria-label={`Attacks from ${attacker.name} to ${target.name}`}
                      >
                        {cellAttackList.map((event) => (
                          <article key={event.id} className="attack-matrix-card">
                            <div className="attack-matrix-card-head">
                              <span className="attack-matrix-card-id">
                                {event.id}
                              </span>
                              <span className="attack-matrix-card-severity">
                                Attack
                              </span>
                            </div>
                            <p className="attack-matrix-card-claim">
                              {event.content ?? event.title ?? ""}
                            </p>
                            <div className="attack-matrix-card-foot">
                              <span className="attack-matrix-card-pair">
                                {attacker.name} <ArrowRight size={12} aria-hidden="true" /> {target.name}
                              </span>
                              <span className="attack-matrix-card-time">
                                {event.round ?? ""}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div
                    className="attack-matrix-cell attack-matrix-cell-empty"
                    role="gridcell"
                    aria-label={`No attacks from ${attacker.name} to ${target.name}`}
                  >
                    <span className="attack-matrix-empty" aria-hidden="true">
                      &mdash;
                    </span>
                  </div>
                )}
              </div>
            );
          });

          return (
            <div key={attacker.id} className="attack-matrix-row attack-matrix-data-row" role="row">
              <div className={`attack-matrix-row-header ${attacker.color}`}>
                {attacker.name}
              </div>
              {rowCells}
            </div>
          );
        })}
      </div>
    </div>
  );
}