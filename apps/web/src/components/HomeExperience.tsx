import { useState } from "react";
import { Link } from "react-router-dom";
import { trialTemplates } from "../data/home";
import { ArenaStage } from "./ArenaStage";
import { IdeaInputCard } from "./idea-input-card";
import { t } from "../i18n";

const valueCards = [
  [t("landing.value.standard.title"), t("landing.value.standard.body")],
  [t("landing.value.replay.title"), t("landing.value.replay.body")],
  [t("landing.value.passport.title"), t("landing.value.passport.body")],
  [t("landing.value.discover.title"), t("landing.value.discover.body")],
] as const;

export function HomeExperience() {
  const [selected, setSelected] = useState<(typeof trialTemplates)[number]>(trialTemplates[0]);
  const choose = (template: typeof trialTemplates[number]) => { setSelected(template); };
  return <main className="home-page">
    <section className="home-hero"><div className="hero-copy"><p className="eyebrow">{t("landing.hero.eyebrow")}</p><h1><span>{t("landing.hero.line1")}</span>{t("landing.hero.line2")}<em>{t("landing.hero.line3")}</em></h1><p>{t("landing.hero.description")}</p><div className="hero-actions"><Link to="/battle/BA-2026-0024?mode=verified_replay" className="button primary">{t("landing.cta.watch_replay")}</Link><a href="#live-battle" className="button secondary">{t("landing.cta.live_battle")}</a></div><div className="live-now"><b>● {t("landing.hero.live_now")}</b><span>{t("landing.hero.live_summary")}</span></div></div><ArenaStage compact /></section>
    <section className="why-arena"><header><p className="eyebrow">{t("landing.why.eyebrow")}</p><h2>{t("landing.why.title")}</h2></header><div>{valueCards.map(([title,copy],index) => <article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="trial-section" id="templates"><header><p className="eyebrow">{t("landing.templates.eyebrow")}</p><h2>{t("landing.templates.title")}</h2></header><div className="trial-strip">{trialTemplates.map((template) => <button type="button" key={template.id} className={selected.id === template.id ? "selected" : ""} onClick={() => choose(template)}><img src={template.portrait} alt="" /><span>{template.kicker}</span><h3>{template.title}</h3><footer><b>{template.rounds} {t("landing.template.rounds")}</b><small>{template.agents} {t("landing.template.agents")}</small></footer></button>)}</div></section>
    <section id="live-battle" className="live-battle-entry" aria-label={t("landing.live.title")}>
      <header>
        <p className="eyebrow">{t("landing.live.eyebrow")}</p>
        <h2>{selected.title}</h2>
        <p>{t("landing.live.description")}</p>
        <div className="live-battle-meta">
          <span>{selected.rounds} {t("landing.template.rounds")}</span>
          <span>{selected.agents} {t("landing.template.agents")}</span>
          <span>{t("landing.brief.meta")}</span>
        </div>
      </header>
      <div className="live-battle-compose">
        <IdeaInputCard key={selected.id} initialIdea={selected.brief} />
      </div>
    </section>
  </main>;
}
