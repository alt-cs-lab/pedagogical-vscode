import { configureStore } from "@reduxjs/toolkit";
import { startMessageObserver } from "./util/messageObserver";
import { AppListenerMiddlewareInstance, appListenerMiddleware } from "./listenerMiddleware";
import sessionsSlice from "./features/sessions/sessionsSlice";
import { startStateChangedListener } from "./stateChangeListener";
import rulesSlice from "./features/rulesEngine/rulesSlice";

// load redux devtools if this is a dev environment
// there's probably a better way to do this
const scriptData = document.getElementById("scriptData") as HTMLScriptElement;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const isDevEnvironment = JSON.parse(scriptData.text).isEnvDevelopment as boolean;

export const store = configureStore({
  reducer: {
    [rulesSlice.name]: rulesSlice.reducer,
    [sessionsSlice.name]: sessionsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(appListenerMiddleware.middleware),
  devTools: isDevEnvironment,
});

startStateChangedListener(appListenerMiddleware as AppListenerMiddlewareInstance);
startMessageObserver();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
