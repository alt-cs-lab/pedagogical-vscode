import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { flowSlice } from "./features/flow/flowSlice";
import { sessionsSlice } from "./features/sessions/sessionsSlice";
import { startMessageObserver } from "./services/messageObserver";
import { startDebugListener } from "./features/sessions/debugAdapters/listener";
import { defaultDebugReducer } from "./features/sessions/debugAdapters/default/reducer";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    defaultDebugReducer,
    [sessionsSlice.name]: sessionsSlice.reducer,
    [flowSlice.name]: flowSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
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
startDebugListener(listenerMiddleware);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
