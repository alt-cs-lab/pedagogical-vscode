import { Reducer, configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { startMessageObserver } from "./util/messageObserver";
import { appListenerMiddleware } from "./listenerMiddleware";
import sessionManager from "./features/sessions/sessionManager";
import sessionManagerSlice from "./features/sessions/sessionsSlice";

const scriptData = document.getElementById("scriptData") as any;
const isDevEnvironment = JSON.parse(scriptData.text).isEnvDevelopment;

type StoreReducerType = {
  [sessionManagerSlice.name]: typeof sessionManagerSlice.reducer,
  [k: string]: Reducer,
}

export const staticReducer: StoreReducerType = {
  [sessionManagerSlice.name]: sessionManagerSlice.reducer,
};

export const store = configureStore({
  reducer: staticReducer,
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware().prepend(appListenerMiddleware.middleware)
  ),
  devTools: isDevEnvironment,
  enhancers: [
    devToolsEnhancer({
      hostname: "localhost",
      port: 8000,
      secure: false,
      realtime: isDevEnvironment,
      // disable hot reload because it re-triggers all actions after replaceReducer
      shouldHotReload: false,
    }),
  ],
});

startMessageObserver();
sessionManager.startListeners();
// registerDebugListeners();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
