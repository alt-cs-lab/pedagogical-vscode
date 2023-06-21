import { configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { debugAdapterApi } from "./services/debugAdapterApi";
import { flowSlice } from "./features/flow/flowSlice";
import { debugListener } from "./features/middleware/debugListener";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const store = configureStore({
  reducer: {
    [debugAdapterApi.reducerPath]: debugAdapterApi.reducer,
    flow: flowSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(debugAdapterApi.middleware, debugListener.middleware),
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
