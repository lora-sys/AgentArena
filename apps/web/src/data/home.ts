export const trialTemplates = [
  { id: "hackathon", title: "Hackathon Idea Battle", kicker: "PROVE THE DEMO", rounds: 5, agents: 3, portrait: "/assets/agents/safe-builder.png", brief: "Design the most memorable evidence-based AI agent product that can be demonstrated reliably in 48 hours." },
  { id: "product", title: "Product Design Review", kicker: "TEST THE EXPERIENCE", rounds: 4, agents: 3, portrait: "/assets/agents/viral-designer.png", brief: "Review a product concept for clarity, differentiation, usability, and its ability to create a convincing first-run experience." },
  { id: "architecture", title: "Code Architecture Battle", kicker: "BREAK THE SYSTEM", rounds: 5, agents: 3, portrait: "/assets/agents/infra-hacker.png", brief: "Compare competing architectures and expose the highest-risk reliability, security, and scalability assumptions." },
  { id: "research", title: "Research Deep Dive", kicker: "CHALLENGE THE CLAIMS", rounds: 4, agents: 3, portrait: "/assets/agents/safe-builder.png", brief: "Produce an evidence-bound research recommendation and challenge every unsupported assumption before selecting a winner." },
] as const;
