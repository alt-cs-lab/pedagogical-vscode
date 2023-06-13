import { configureStore } from "@reduxjs/toolkit";
import appReducer, { AppState } from "./features/app/appSlice";
import { vscode } from "./util/vscode";
import { addMessage } from "./features/app/appSlice";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { WebviewMessage } from "shared";
import { DebugProtocol } from "@vscode/debugprotocol";

function getPreloadedState(): { app: AppState } | undefined {
  const state = vscode.getState();
  if (state !== undefined && (state as AppState).messages !== undefined) {
    return state as { app: AppState };
  }
  return undefined;
}

const scriptData = document.getElementById("scriptData") as any;
const isEnvDevelopment = JSON.parse(scriptData.text).isEnvDevelopment;

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
  preloadedState: getPreloadedState(),
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
    store.dispatch(addMessage(msg as DebugProtocol.ProtocolMessage));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
