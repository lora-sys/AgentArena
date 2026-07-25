import { t } from "../i18n";

export const trialTemplates = [
  { id: "hackathon", title: t("landing.template.hackathon.title"), kicker: t("landing.template.hackathon.kicker"), rounds: 5, agents: 3, portrait: "/assets/agents/safe-builder.png", brief: t("landing.template.hackathon.brief") },
  { id: "product", title: t("landing.template.product.title"), kicker: t("landing.template.product.kicker"), rounds: 4, agents: 3, portrait: "/assets/agents/viral-designer.png", brief: t("landing.template.product.brief") },
  { id: "architecture", title: t("landing.template.architecture.title"), kicker: t("landing.template.architecture.kicker"), rounds: 5, agents: 3, portrait: "/assets/agents/infra-hacker.png", brief: t("landing.template.architecture.brief") },
  { id: "research", title: t("landing.template.research.title"), kicker: t("landing.template.research.kicker"), rounds: 4, agents: 3, portrait: "/assets/agents/safe-builder.png", brief: t("landing.template.research.brief") },
] as const;
