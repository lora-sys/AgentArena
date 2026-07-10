import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI Kit/Card",
  component: Card,
  argTypes: {
    elevation: { control: "select", options: [0, 1, 2, 3] },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    elevation: 1,
    padding: "md",
    children: (
      <div>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "var(--t-lg)", fontWeight: "var(--w-bold)" }}>Card title</h3>
        <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>Card body content goes here.</p>
      </div>
    ),
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
      <Card elevation={0} padding="md">
        <strong>Elevation 0</strong>
        <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>No shadow. Flat surface.</p>
      </Card>
      <Card elevation={1} padding="md">
        <strong>Elevation 1</strong>
        <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>Subtle depth. Default.</p>
      </Card>
      <Card elevation={2} padding="md">
        <strong>Elevation 2</strong>
        <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>Raised panel.</p>
      </Card>
      <Card elevation={3} padding="md">
        <strong>Elevation 3</strong>
        <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>Floating modal.</p>
      </Card>
      <Card elevation={1} padding="none">
        <div style={{ padding: "var(--s-4)" }}>Padding: none (custom layout)</div>
      </Card>
      <Card elevation={1} padding="sm">
        Padding: sm
      </Card>
      <Card elevation={1} padding="md">
        Padding: md (default)
      </Card>
      <Card elevation={1} padding="lg">
        Padding: lg
      </Card>
      <Card interactive selected>
        <strong>Interactive + Selected</strong>
        <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>Clickable, currently selected.</p>
      </Card>
      <Card interactive>
        <strong>Interactive (not selected)</strong>
        <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-sm)" }}>Clickable surface.</p>
      </Card>
    </div>
  ),
};

export const Keyboard: Story = {
  name: "Keyboard / Focus order",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "400px" }}>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        Only interactive cards receive focus. Tab navigates between them. Press Enter/Space to activate.
      </p>
      <Card interactive>
        First selectable card
      </Card>
      <Card interactive>
        Second selectable card
      </Card>
      <Card>
        Non-interactive card (not in tab order)
      </Card>
    </div>
  ),
};

export const ScreenReader: Story = {
  name: "Screen reader transcript",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
          Interactive card: VoiceOver reads "First selectable card, button, not pressed"
        </p>
        <Card interactive>First selectable card</Card>
      </div>
      <div>
        <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
          Selected card: VoiceOver reads "Interactive selected card, button, pressed"
        </p>
        <Card interactive selected>Interactive selected card</Card>
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  render: () => (
    <Card interactive>
      <p style={{ margin: 0 }}>Hover lift transition is disabled under prefers-reduced-motion.</p>
    </Card>
  ),
};
