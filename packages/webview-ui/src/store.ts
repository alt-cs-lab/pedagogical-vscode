import { Reducer, configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { flowSlice } from "./features/flow/flowSlice";
import { startMessageObserver } from "./util/messageObserver";
import { registerDebugListeners } from "./features/strategies/listeners";
import { appListenerMiddleware } from "./listenerMiddleware";
import sessionManager from "./features/sessions/sessionManager";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const staticReducer: Record<string, Reducer> = {
  // [sessionsSlice.name]: sessionsSlice.reducer,
  [flowSlice.name]: flowSlice.reducer,
};

export const store = configureStore({
  reducer: staticReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(appListenerMiddleware.middleware),
  devTools: isEnvDevelopment,
  enhancers: [
    devToolsEnhancer({
      hostname: "localhost",
      port: 8000,
      secure: false,
      realtime: isEnvDevelopment,
    }),
  ],
});

startMessageObserver();
sessionManager.startListeners();
// registerDebugListeners();

export type RootState = ReturnType<typeof store.getState> & Record<string, unknown>;
export type AppDispatch = typeof store.dispatch;
