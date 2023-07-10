import { ListenerMiddlewareInstance, PayloadAction } from "@reduxjs/toolkit";
import { addDefaultListener } from "./default/defaultListener";
import { PayloadActionWithDebugType, addSession } from "../sessionsSlice";

function hasMetaDebugType(action: PayloadAction<any, string, any>): action is PayloadActionWithDebugType<any> {
  return action.meta?.debugType !== undefined;
}

export function startDebugListener(listenerMiddleware: ListenerMiddlewareInstance) {
  listenerMiddleware.startListening({
    matcher: hasMetaDebugType,
    effect: (action, api) => {
      // TODO: switch on debug type
      if (addSession.match(action)) {
        api.dispatch(addDefaultListener(action.payload.sessionId));
      }
    },
  });
}
