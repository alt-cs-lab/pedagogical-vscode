import { ReducersMapObject, StateFromReducersMapObject, configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { startMessageObserver } from "./util/messageObserver";
import { appListenerMiddleware } from "./listenerMiddleware";
import sessionsSlice from "./features/sessions/sessionsSlice";
import { vscode } from "./util";

const scriptData = document.getElementById("scriptData") as any;
const isDevEnvironment = JSON.parse(scriptData.text).isEnvDevelopment;

const storeReducer = {
  [sessionsSlice.name]: sessionsSlice.reducer,
};

export const store = configureStore({
  reducer: storeReducer,
  preloadedState: vscode.getState() as StateFromReducersMapObject<typeof storeReducer> | undefined,
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

// sessionManager.postInitialize();
startMessageObserver();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
