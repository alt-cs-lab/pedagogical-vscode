import React from "react";
import type { Preview } from "@storybook/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import "../src/defaultColorTheme.css";
import "./styleDefault.css";
import "reactflow/dist/style.css";

// Declarations for different vscode color themes.
// To get these values open devtools while running the extension, go to the webview panel's html tag,
// right-click the element.style selector on the right, and copy all declarations.
import "./colorThemes/solarizedDark.css";
import "./colorThemes/defaultHighContrast.css";
import "./colorThemes/defaultHighContrastLight.css";
import "./colorThemes/defaultLightModern.css";
import "./colorThemes/githubDarkDefault.css";
import "./colorThemes/githubLightDefault.css";

// Dummy redux store because the components need one to work
const store = configureStore({ reducer: {} });

const preview: Preview = {
  globalTypes: {
    colorTheme: {
      description: "VS Code color theme",
      default: "Dark Modern",
      toolbar: {
        title: "Color Theme",
        dynamicTitle: true,
        items: [
          "Default Dark Modern",
          "Solarized Dark",
          "GitHub Dark Default",
          "Default Light Modern",
          "GitHub Light Default",
          "Default High Contrast",
          "Default High Contrast Light",
        ],
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div
        data-color-theme={context.globals.colorTheme}
        style={{
          scrollbarColor:
            "var(--vscode-scrollbarSlider-background) var(--vscode-editor-background)",
          backgroundColor: "var(--vscode-editor-background)",
          color: "var(--vscode-editor-foreground)",
          fontFamily: "var(--vscode-font-family)",
          fontWeight: "var(--vscode-font-weight)",
          fontSize: "var(--vscode-font-size)",
          minHeight: "100vh",
          margin: -16,
          padding: 16,
        }}
      >
        <Provider store={store}>
          <Story />
        </Provider>
      </div>
    ),
  ],
};

export default preview;
