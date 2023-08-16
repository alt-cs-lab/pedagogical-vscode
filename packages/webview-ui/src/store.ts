import { configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { startMessageObserver } from "./util/messageObserver";
import { AppListenerMiddlewareInstance, appListenerMiddleware } from "./listenerMiddleware";
import sessionsSlice from "./features/sessions/sessionsSlice";
import { startStateChangedListener } from "./stateChangeListener";

// load redux devtools if this is a dev environment
// there's probably a better way to do this
const scriptData = document.getElementById("scriptData") as any;
const isDevEnvironment = JSON.parse(scriptData.text).isEnvDevelopment as boolean;

export const store = configureStore({
  reducer: {
    [sessionsSlice.name]: sessionsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware().prepend(appListenerMiddleware.middleware)
  ),
  devTools: isDevEnvironment,
  enhancers: isDevEnvironment ? [
    devToolsEnhancer({
      hostname: "localhost",
      port: 8000,
      secure: false,
      realtime: isDevEnvironment,
      suppressConnectErrors: true,
      trace: true,
    }),
  ] : undefined,
});

// sessionManager.postInitialize();
startStateChangedListener(appListenerMiddleware as AppListenerMiddlewareInstance);
startMessageObserver();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
