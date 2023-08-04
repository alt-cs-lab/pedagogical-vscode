import { Reducer, configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { startMessageObserver } from "./util/messageObserver";
import { appListenerMiddleware } from "./listenerMiddleware";
import sessionManager from "./features/sessions/sessionManager";
import sessionsSlice, { SessionManagerState } from "./features/sessions/sessionsSlice";
import { BaseSessionState } from "./features/sessions/debugSessions/BaseSession";

const scriptData = document.getElementById("scriptData") as any;
const isDevEnvironment = JSON.parse(scriptData.text).isEnvDevelopment;

// TODO: fix this type
// maybe move the index type into another property
export type StoreState = {
  [sessionsSlice.name]: SessionManagerState,
  [k: string]: BaseSessionState,
};

export type StoreReducerType = {
  [sessionsSlice.name]: typeof sessionsSlice.reducer,
  [k: string]: Reducer,
};

export const staticReducer: StoreReducerType = {
  [sessionsSlice.name]: sessionsSlice.reducer,
};

// initialize the sessions in sessionManager first,
// then configure store with the resulting reducer and preloadedState.
// TODO: refactor: create a storeManager instead of just a sessionManager
const { reducer, initialState } = await sessionManager.initialize();

export const store = configureStore({
  reducer: reducer,
  preloadedState: initialState,
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

sessionManager.postInitialize();
startMessageObserver();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
