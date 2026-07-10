import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI Kit/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Start battle",
    variant: "primary",
    size: "md",
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
    </div>
  ),
};

export const Keyboard: Story = {
  name: "Keyboard / Focus order",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        Tab through the buttons below. Focus ring (2px outline) appears on the focused button.
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Button variant="primary">First (Tab)</Button>
        <Button variant="secondary">Second (Tab)</Button>
        <Button variant="ghost">Third (Tab)</Button>
        <Button variant="danger">Fourth (Tab)</Button>
      </div>
    </div>
  ),
};

export const ScreenReader: Story = {
  name: "Screen reader transcript",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)", marginBottom: "0.5rem" }}>
          VoiceOver reads: "Start battle, button"
        </p>
        <Button>Start battle</Button>
      </div>
      <div>
        <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)", marginBottom: "0.5rem" }}>
          VoiceOver reads: "Loading, busy, button" (aria-busy=true)
        </p>
        <Button loading>Submit</Button>
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "var(--t-sm)", color: "var(--fg-muted)" }}>
        Under prefers-reduced-motion: reduce, the loading spinner does not rotate (animation removed by global token override).
      </p>
      <Button loading>Loading (still frame)</Button>
    </div>
  ),
};
