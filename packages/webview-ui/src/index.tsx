import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import sessionManager from "./features/sessions/sessionManager";
import { startStateChangedListener } from "./stateChangeListener";
import { AppListenerMiddlewareInstance, appListenerMiddleware } from "./listenerMiddleware";

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

sessionManager.initialize().then(() => {
  sessionManager.startListeners();
});
startStateChangedListener(appListenerMiddleware as AppListenerMiddlewareInstance);
