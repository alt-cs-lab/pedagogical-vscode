import React from "react";
import { createRoot } from "react-dom/client";
import App from "./features/app/App";
import { Provider } from "react-redux";
import { store } from "./store";

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
