import { configureStore } from "@reduxjs/toolkit";
import messagesReducer, { addMessage } from "./features/message/messagesSlice";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { debugAdapterApi } from "./services/debug-adapter";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const store = configureStore({
  reducer: {
    [debugAdapterApi.reducerPath]: debugAdapterApi.reducer,
    messages: messagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(debugAdapterApi.middleware),
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

window.addEventListener("message", (ev) => {
  const msg = ev.data;
  if (msg.type === "debugTrackerMessage") {
    store.dispatch(addMessage(msg.data));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
