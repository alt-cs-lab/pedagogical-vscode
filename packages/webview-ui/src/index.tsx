import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { ReactFlowProvider } from "reactflow";
import App from "./App";

import "./defaultColorTheme.css";

const container = document.getElementById("root");
if (container === null) {
  throw new Error();
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </Provider>
  </React.StrictMode>,
);
