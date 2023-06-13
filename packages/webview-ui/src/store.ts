import { configureStore } from "@reduxjs/toolkit";
import messagesReducer, { addMessage } from "./features/message/messagesSlice";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { WebviewMessage } from "shared";

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
  },
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
  const msg = ev.data as WebviewMessage;
  if (msg.type === "debugTrackerMessage") {
    store.dispatch(addMessage(msg.data));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
