import type { Meta, StoryObj } from "@storybook/react";
import { SeverityTag } from "./severity-tag";

const meta: Meta<typeof SeverityTag> = {
  title: "UI Kit/SeverityTag",
  component: SeverityTag,
  argTypes: {
    severity: {
      control: "select",
      options: ["low", "med", "high", "fatal"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SeverityTag>;

export const Default: Story = {
  args: {
    severity: "high",
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <SeverityTag severity="low" />
        <SeverityTag severity="med" />
        <SeverityTag severity="high" />
        <SeverityTag severity="fatal" />
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <SeverityTag severity="low" label="INFO" />
        <SeverityTag severity="med" label="WARN" />
        <SeverityTag severity="high" label="CRIT" />
        <SeverityTag severity="fatal" label="KILL" />
      </div>
    </div>
  ),
};

export const Keyboard: Story = {
  name: "Keyboard / Focus order",
  render: () => (
    <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
      SeverityTag is a status indicator, not an interactive control. It is not focusable.
    </p>
  ),
};

export const ScreenReader: Story = {
  name: "Screen reader transcript",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        VoiceOver reads: "Severity: HIGH, status" (role=status provides the context)
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <SeverityTag severity="low" />
        <SeverityTag severity="med" />
        <SeverityTag severity="high" />
        <SeverityTag severity="fatal" />
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  render: () => (
    <div>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        SeverityTag has no motion. Icon + label communicates severity without relying on color alone (D7).
      </p>
      <SeverityTag severity="fatal" evidenceId="ev_8f2a_0042" />
    </div>
  ),
};
