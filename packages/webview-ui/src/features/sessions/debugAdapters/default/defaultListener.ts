import { fetchScopes, fetchSessionState, fetchStackTrace, fetchThreads, fetchVariables } from "../thunks";
import { DebugSessionAction, debuggerPaused, removeSession } from "../../sessionsSlice";
import { buildFlow } from "../../../flow/builders/default";
import { AppListenerMiddlewareInstance } from "../listeners";

// TODO: actual predicate
function defaultDebugActionMatcher(action: DebugSessionAction): action is DebugSessionAction {
  return action.meta.debugType !== undefined;
}

export function registerDefaultDebugListener(middleware: AppListenerMiddlewareInstance) {
  middleware.startListening({
    // alternatively, start a listener for each action with the matcher isAllOf(<debug matcher>, <action matcher>)
    matcher: defaultDebugActionMatcher,
    effect: (action, api) => {
      const sessionId = action.meta.sessionId;

      // we could also switch based on action.type,
      // but these match functions give us type assertion
      if (debuggerPaused.match(action)) {
        api.dispatch(fetchSessionState({ sessionId })); // TODO: fix any
      }

      else if (fetchSessionState.fulfilled.match(action)) {
        api.dispatch(buildFlow({ sessionId }));
      }

      else if (fetchThreads.fulfilled.match(action)) {
        for (const thread of action.payload.threads) {
          api.dispatch(fetchStackTrace({ sessionId, threadId: thread.id }));
        }
      }

      else if (fetchStackTrace.fulfilled.match(action)) {
        for (const frame of action.payload.stackFrames) {
          api.dispatch(fetchScopes({ sessionId, frameId: frame.id }));
        }
      }

      else if (fetchScopes.fulfilled.match(action)) {
        for (const scope of action.payload.scopes) {
          api.dispatch(fetchVariables({ sessionId, variablesReference: scope.variablesReference }));
        }
      }

      else if (fetchVariables.fulfilled.match(action)) {
        // TODO
      }

      else if (removeSession.match(action)) {
        api.unsubscribe();
      }
    },
  });
}
