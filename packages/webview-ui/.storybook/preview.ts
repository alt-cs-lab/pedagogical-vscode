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
      values: [{ name: "default", value: "#181818" }],
    },
  },
};

export default preview;
