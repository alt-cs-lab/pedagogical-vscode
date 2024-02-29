import type { Preview } from "@storybook/react";

import "./styleDeclarations.css";
import "./styleDefault.css";
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
    backgrounds: {
      values: [{ name: "editor background default", value: "#1f1f1f" }],
    },
  },
};

export default preview;
