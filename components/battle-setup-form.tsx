"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Check, Clock3, FileText, Plus, Scale, Swords, Target, X } from "lucide-react";
import { teams } from "@/lib/demo-data";
import { TeamScoreCard } from "./arena-cards";

const defaultIdea = `Build "Agent Metaverse" - a persistent 3D workspace where AI agents collaborate with humans to plan, build, and ship products.

Core capabilities: agent avatars with memory, real-time co-editing of plans and docs, integrations (Figma, GitHub, Slack), and a marketplace for agent plugins and templates.

Goal: Define the MVP, key user journeys, technical architecture, go-to-market strategy, and a 90-day execution plan.`;

const outputOptions = [
  ["product_brief", "Strategy"],
  ["architecture", "Architecture"],
  ["todo", "Roadmap"],
  ["pitch_outline", "GTM Plan"],
  ["prd", "Risks"]
] as const;

export function BattleSetupForm() {
  const [idea, setIdea] = useState(defaultIdea);
  const [battleType, setBattleType] = useState("Cross Attack");
  const [timeLimit, setTimeLimit] = useState("48 hours");
  const [preference, setPreference] = useState("Balanced");
  const [outputs, setOutputs] = useState(outputOptions.map(([id]) => id));
  const [constraints, setConstraints] = useState(["Budget: $150K", "Team: 6 people", "Tech: Web + AI"]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const router = useRouter();

  const count = useMemo(() => idea.length, [idea]);

  const toggleOutput = (id: (typeof outputOptions)[number][0]) => {
    setOutputs((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const addConstraint = () => {
    const next = window.prompt("Add a battle constraint", "Must be demoable in 48 hours");
    if (next?.trim()) setConstraints((current) => [...current, next.trim()]);
  };

  const removeConstraint = (target: string) => {
    setConstraints((current) => current.filter((constraint) => constraint !== target));
  };

  const startBattle = async () => {
    setIsStarting(true);
    setStartError("");

    const settings = {
      battleType: battleType === "Speed Trial" ? "coding" : battleType === "Panel Review" ? "research" : "hackathon",
      timeLimit: timeLimit === "24 hours" ? "24h" : timeLimit === "7 days" ? "7d" : "48h",
      preference: preference.toLowerCase(),
      outputTargets: outputs,
    };

    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idea, settings, constraints }),
      });

      if (!response.ok) {
        throw new Error("Battle API failed to create a seeded run.");
      }

      const data = (await response.json()) as { battleId?: string };
      const battleId = data.battleId ?? "demo";
      window.localStorage.setItem(
        "agent-arena-last-setup",
        JSON.stringify({
          battleId,
          idea,
          battleType,
          timeLimit,
          preference,
          outputs,
          constraints,
          createdAt: new Date().toISOString(),
        }),
      );
      router.push(`/battle/${battleId}/live` as Route);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "Could not start this battle.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="setup-grid">
      <section className="section-card setup-card">
        <h1>Put your idea in the arena.</h1>
        <p>Three AI teams. One mission. Find the best path forward.</p>
        <label htmlFor="idea">Mission / Challenge</label>
        <textarea id="idea" value={idea} onChange={(event) => setIdea(event.target.value)} maxLength={2000} />
        <div className="char-count">{count}/2000</div>

        <div className="settings-table">
          <div className="setting-row setting-row-wide">
            <span><Target size={18} /></span>
            <strong>Constraints</strong>
            <div className="tag-editor">
              {constraints.map((constraint) => (
                <button key={constraint} type="button" className="config-tag" onClick={() => removeConstraint(constraint)}>
                  {constraint}
                  <X size={13} />
                </button>
              ))}
            </div>
            <button type="button" aria-label="Add constraint" onClick={addConstraint}>
              <Plus size={16} />
            </button>
          </div>
          <SettingSelect
            icon={<Swords size={18} />}
            label="Battle Type"
            value={battleType}
            options={["Cross Attack", "Panel Review", "Speed Trial"]}
            onChange={setBattleType}
          />
          <SettingSelect
            icon={<Clock3 size={18} />}
            label="Time Limit"
            value={timeLimit}
            options={["24 hours", "48 hours", "7 days"]}
            onChange={setTimeLimit}
          />
          <SettingSelect
            icon={<Scale size={18} />}
            label="Preference"
            value={preference}
            options={["Balanced", "Viral", "Technical", "Safe"]}
            onChange={setPreference}
          />
          <div className="setting-row setting-row-wide">
            <span><FileText size={18} /></span>
            <strong>Output Targets</strong>
            <div className="tag-editor">
              {outputOptions.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`config-tag ${outputs.includes(id) ? "selected" : ""}`}
                  onClick={() => toggleOutput(id)}
                >
                  {outputs.includes(id) ? <Check size={13} /> : null}
                  {label}
                </button>
              ))}
            </div>
            <button type="button" aria-label="Select all outputs" onClick={() => setOutputs(outputOptions.map(([id]) => id))}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="section-card preview-card">
        <h2>Battle Preview</h2>
        <p>Review your settings and the teams that will compete.</p>
        <div className="preview-summary">
          <SummaryItem icon={<Swords size={18} />} label="Battle Type" value={battleType} />
          <SummaryItem icon={<Clock3 size={18} />} label="Time Limit" value={timeLimit} />
          <SummaryItem icon={<Scale size={18} />} label="Preference" value={preference} />
          <SummaryItem icon={<Target size={18} />} label="Outputs" value={`${outputs.length} selected`} />
        </div>
        <div className="preview-teams">
          {teams.map((team) => (
            <TeamScoreCard key={team.id} team={team} />
          ))}
        </div>
        <div className="setup-actions">
          <button className="ghost-button" type="button" onClick={() => setPreviewOpen(true)}>
            <FileText size={16} />
            Preview Brief
          </button>
          <button className="primary-action button-reset" type="button" onClick={startBattle} disabled={isStarting}>
            <Swords size={18} />
            {isStarting ? "Starting..." : "Start Battle"}
          </button>
        </div>
        {startError ? <p className="form-error">{startError}</p> : null}
      </section>

      {previewOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <div className="modal-panel brief-panel" role="dialog" aria-modal="true" aria-labelledby="brief-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close preview brief" onClick={() => setPreviewOpen(false)}>
              <X size={18} />
            </button>
            <h2 id="brief-title">Battle Brief Preview</h2>
            <p>{idea.split("\n")[0]}</p>
            <dl className="brief-list">
              <div><dt>Battle Type</dt><dd>{battleType}</dd></div>
              <div><dt>Time Limit</dt><dd>{timeLimit}</dd></div>
              <div><dt>Preference</dt><dd>{preference}</dd></div>
              <div><dt>Constraints</dt><dd>{constraints.join(", ")}</dd></div>
              <div><dt>Outputs</dt><dd>{outputs.join(", ")}</dd></div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SettingSelect({
  icon,
  label,
  value,
  options,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="setting-row">
      <span>{icon}</span>
      <strong>{label}</strong>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <i />
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article>
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
