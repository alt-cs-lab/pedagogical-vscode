import { configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { flowSlice } from "./features/flow/flowSlice";
import { sessionsSlice } from "./features/sessions/sessionsSlice";
import { startMessageObserver } from "./util/messageObserver";
import { registerDebugListeners } from "./features/strategies/listeners";
import { appListenerMiddleware } from "./listenerMiddleware";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const store = configureStore({
  reducer: {
    [sessionsSlice.name]: sessionsSlice.reducer,
    [flowSlice.name]: flowSlice.reducer,
  },
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
registerDebugListeners();

export type RootState = ReturnType<typeof store.getState> & Record<string, unknown>;
export type AppDispatch = typeof store.dispatch;
