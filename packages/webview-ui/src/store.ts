import { Reducer, configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { startMessageObserver } from "./util/messageObserver";
import { appListenerMiddleware } from "./listenerMiddleware";
import sessionManager from "./features/sessions/sessionManager";
import sessionsSlice from "./features/sessions/sessionsSlice";

const scriptData = document.getElementById("scriptData") as any;
const isDevEnvironment = JSON.parse(scriptData.text).isEnvDevelopment;

type StoreReducerType = {
  [sessionsSlice.name]: typeof sessionsSlice.reducer,
  [k: string]: Reducer,
};

export const staticReducer: StoreReducerType = {
  [sessionsSlice.name]: sessionsSlice.reducer,
};

// TODO: initialize the sessions in sessionManager first,
// then configure store with the resulting reducer and preloadedState.

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
// sessionManager.initialize().then(() => {
//   sessionManager.startListeners();
// });
// registerDebugListeners();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
