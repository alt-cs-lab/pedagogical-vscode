import { createAction } from "@reduxjs/toolkit";

function debugActionPrepareFn<Payload = void>() {
  return (sessionId: string, debugType: string, payload: Payload) => ({
    payload,
    meta: { sessionId, debugType },
  });
}

export const debuggerPaused = createAction(
  "sessions/debuggerPaused",
  debugActionPrepareFn(),
);

export const buildFlow = createAction(
  "sessions/buildFlow",
  debugActionPrepareFn(),
);

export const addSession = createAction(
  "sessions/addSession",
  (payload: { id: string, name: string, type: string }) => {
    return { payload, meta: { sessionId: payload.id, debugType: payload.type } };
  },
);
