import { createListenerMiddleware } from "@reduxjs/toolkit";
import { debugAdapterApi } from "../../services/debugAdapterApi";
import { generateFlow } from "../flow/flowSlice";

export const debugListener = createListenerMiddleware();

debugListener.startListening({
  matcher: debugAdapterApi.endpoints.getSession.matchFulfilled,
  effect: (action, listenerApi) => {
    listenerApi.dispatch(generateFlow(action.payload));
  },
});
