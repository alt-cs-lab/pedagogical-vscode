import { addListener } from "@reduxjs/toolkit";
import { fetchScopes, fetchStackTrace, fetchThreads, fetchVariables, isFetchFulfilledAction } from "./thunks";
import { debuggerPaused, removeSession } from "../../sessionsSlice";

export function addDefaultListener(sessionId: string) {
  return addListener({
    predicate: (action) => {
      let actionSessionId: string | undefined = action.payload?.sessionId;
      if (actionSessionId === undefined && isFetchFulfilledAction(action)) {
        actionSessionId = action.meta.arg.sessionId;
      }
      return sessionId === actionSessionId;
    },
    effect: (action, api) => {
      // we could also switch based on action.type,
      // but these match functions give us type assertion
      if (debuggerPaused.match(action)) {
        api.dispatch(fetchThreads({ sessionId }));
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