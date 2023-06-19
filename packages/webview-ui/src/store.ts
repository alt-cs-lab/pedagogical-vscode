import { configureStore } from "@reduxjs/toolkit";
import { eventsReducer } from "./features/events/eventsSlice";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { debugAdapterApi } from "./services/debugAdapterApi";
import { scopesReducer } from "./features/scopes/scopesSlice";
import { stackTraceReducer } from "./features/stackTrace/stackTraceSlice";
import { threadsReducer } from "./features/threads/threadsSlice";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const store = configureStore({
  reducer: {
    [debugAdapterApi.reducerPath]: debugAdapterApi.reducer,
    events: eventsReducer,
    scopes: scopesReducer,
    stackTrace: stackTraceReducer,
    threads: threadsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(debugAdapterApi.middleware),
  // preloadedState: getPreloadedState(),
  enhancers: [
    devToolsEnhancer({
      hostname: "localhost",
      port: 8000,
      secure: false,
      realtime: isEnvDevelopment,
    }),
  ],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
