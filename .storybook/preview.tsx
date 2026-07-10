import type { Preview } from "@storybook/react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FAFAF9" },
        { name: "dark", value: "#0A0A0A" },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (390x844)",
          styles: { width: "390px", height: "844px" },
        },
        tablet: {
          name: "Tablet (768x1024)",
          styles: { width: "768px", height: "1024px" },
        },
        desktop: {
          name: "Desktop (1440x900)",
          styles: { width: "1440px", height: "900px" },
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
