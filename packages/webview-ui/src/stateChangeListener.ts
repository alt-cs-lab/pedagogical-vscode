import { AnyAction } from "redux";
import { AppListenerMiddlewareInstance } from "./listenerMiddleware";
import { RootState } from "./store";
import { vscode } from "./util";

export function startStateChangedListener(middleware: AppListenerMiddlewareInstance) {
  middleware.startListening({
    predicate: (_action: AnyAction, currentState: RootState, originalState: RootState) => {
      return currentState !== originalState;
    },
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      try {
        await api.delay(50);
        vscode.setState(api.getState());
      } catch (e) {
        // listener was cancelled, do nothing
      }
    },
  });
}
