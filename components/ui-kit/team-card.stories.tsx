import type { Meta, StoryObj } from "@storybook/react";
import { TeamCard } from "./team-card";

const meta: Meta<typeof TeamCard> = {
  title: "UI Kit/TeamCard",
  component: TeamCard,
  argTypes: {
    team: { control: "select", options: ["safe", "viral", "infra"] },
    score: { control: "number" },
    version: { control: "text" },
    loading: { control: "boolean" },
    winner: { control: "boolean" },
    loser: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TeamCard>;

export const Default: Story = {
  args: {
    team: "viral",
    score: 8.1,
    version: "v1",
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
      <TeamCard team="safe" score={7.2} version="v1" />
      <TeamCard team="viral" score={8.1} version="v1" winner />
      <TeamCard team="infra" score={6.5} version="v1" loser />
      <TeamCard team="safe" score={0} version="v1" loading />
      <TeamCard team="viral" score={9.0} version="v2" winner />
      <TeamCard team="infra" score={5.8} version="v1" />
    </div>
  ),
};

export const Keyboard: Story = {
  name: "Keyboard / Focus order",
  render: () => (
    <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
      TeamCard is a display component. It is not focusable. Wrap in a Card with interactive=true to make it focusable.
    </p>
  ),
};

export const ScreenReader: Story = {
  name: "Screen reader transcript",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        VoiceOver reads: "Viral Designer, Strong narrative, 8.1 out of 10, version v1, Champion"
      </p>
      <TeamCard team="viral" score={8.1} version="v1" winner />
    </div>
  ),
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  render: () => (
    <div>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        TeamCard has no animation. State changes (loading → ready → winner) are instant.
      </p>
      <TeamCard team="viral" score={8.1} version="v1" winner />
    </div>
  ),
};
