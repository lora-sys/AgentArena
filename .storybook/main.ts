import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../components/ui-kit/**/*.stories.@(ts|tsx)",
    "../components/ui-kit/**/*.mdx",
    "../app/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableWhatsNew: true,
  },
  typescript: {
    check: false,
  },
};

export default config;
