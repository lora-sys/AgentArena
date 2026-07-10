import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI Kit/Badge",
  component: Badge,
  argTypes: {
    tone: {
      control: "select",
      options: [
        "neutral",
        "team-safe",
        "team-viral",
        "team-infra",
        "champion",
        "sev-low",
        "sev-med",
        "sev-high",
        "sev-fatal",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    tone: "team-safe",
    children: "Safe Builder",
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="team-safe">Safe Builder</Badge>
        <Badge tone="team-viral">Viral Designer</Badge>
        <Badge tone="team-infra">Infra Hacker</Badge>
        <Badge tone="champion">Champion</Badge>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <Badge tone="sev-low">LOW</Badge>
        <Badge tone="sev-med">MED</Badge>
        <Badge tone="sev-high">HIGH</Badge>
        <Badge tone="sev-fatal">FATAL</Badge>
      </div>
    </div>
  ),
};

export const Keyboard: Story = {
  name: "Keyboard / Focus order",
  render: () => (
    <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
      Badge is a non-interactive label. It is not in the tab order. Use Badge to label a parent element (button, card).
    </p>
  ),
};

export const ScreenReader: Story = {
  name: "Screen reader transcript",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        VoiceOver reads the text content directly: "Safe Builder" (no "badge" suffix — it is a generic span, not a widget).
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Badge tone="team-safe">Safe Builder</Badge>
        <Badge tone="team-viral">Viral Designer</Badge>
        <Badge tone="team-infra">Infra Hacker</Badge>
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  render: () => (
    <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
      Badge has no animation. Reduced-motion preference does not affect it.
    </p>
  ),
};
