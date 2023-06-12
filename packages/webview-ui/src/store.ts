import { configureStore } from "@reduxjs/toolkit";
import appReducer, { AppState } from "./components/app/appSlice";
import { vscode } from "./util/vscode";
import { addMessage } from "./components/app/appSlice";

function getPreloadedState(): { app: AppState } | undefined {
  const state = vscode.getState();
  if (state !== undefined && (state as AppState).messages !== undefined) {
    return state as { app: AppState };
  }
  return undefined;
}

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
  preloadedState: getPreloadedState(),
});

window.addEventListener("message", (ev) => {
  if (ev.data.type === "debugProtocolMessage") {
    store.dispatch(addMessage(ev.data.message));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
