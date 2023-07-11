import { AnyAction, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { registerDefaultDebugListener } from "./default/defaultListener";
import { AppDispatch, RootState } from "../../../store";

export type AppListenerMiddlewareInstance = ListenerMiddlewareInstance<RootState, AppDispatch>;

export function getDebugActionMatcher(debugType: string) {
  return (action: AnyAction) => (
    action.meta?.sessionId && action.meta?.debugType === debugType
  );
}

export function registerDebugListeners(middleware: AppListenerMiddlewareInstance) {
  registerDefaultDebugListener(middleware);
}
