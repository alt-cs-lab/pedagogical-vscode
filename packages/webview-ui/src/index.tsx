import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { MessageHandler } from "./services/vscodeMessageHandler";
import App from "./App";

window.addEventListener("message", MessageHandler.handleWindowMessage);

const container = document.getElementById("root");
if (container === null) {
  throw new Error();
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
