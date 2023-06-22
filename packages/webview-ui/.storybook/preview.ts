import type { Preview } from "@storybook/react";

import "reactflow/dist/style.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    parameters: {
      layout: "centered",
    },
  },
};

export default preview;
