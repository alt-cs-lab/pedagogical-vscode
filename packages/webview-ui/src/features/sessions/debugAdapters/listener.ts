import { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { addSession } from "../sessionsSlice";
import { addDefaultListener } from "./default/defaultListener";

export function startDebugListener(listenerMiddleware: ListenerMiddlewareInstance) {
  listenerMiddleware.startListening({
    actionCreator: addSession,
    effect: (action, api) => {
      // TODO: change listener based on debugger type
      api.dispatch(addDefaultListener(action.payload.id));
    },
  });
}