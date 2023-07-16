import { registerDefaultFetchSessionListener } from "./default/fetchSessionListener";
import { AppListenerMiddlewareInstance } from "../../../listenerMiddleware";

export function registerDebugListeners(middleware: AppListenerMiddlewareInstance) {
  //registerPythonDebugListener(middleware);
  registerDefaultFetchSessionListener();
}
