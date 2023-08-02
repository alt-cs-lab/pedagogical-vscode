import { NodeChange } from "reactflow";
import { ThreadEntity, StackFrameEntity, ScopeEntity, VariablesEntity, NodeEntity, EdgeEntity } from "../../entities";
import { createSessionAction } from "../../sessionAction";
import { createAction } from "@reduxjs/toolkit";

type SetAllDebugObjectsPayload = {
  threads: ThreadEntity[];
  stackFrames: StackFrameEntity[];
  scopes: ScopeEntity[];
  variables: VariablesEntity[];
};
export const setAllDebugObjects = createSessionAction<SetAllDebugObjectsPayload>(
  "session/setAllDebugObjects",
);

type SetAllFlowObjectsPayload = {
  nodes: NodeEntity[];
  edges: EdgeEntity[];
};
export const setAllFlowObjects = createSessionAction<SetAllFlowObjectsPayload>(
  "session/setAllFlowObjects",
);

export const buildFlow = createSessionAction(
  "session/buildFlow",
);

export const nodesChanged = createSessionAction<{ changes: NodeChange[] }>(
  "session/nodesChanged",
);

export const updateLastStop = createAction(
  "session/updateLastStop",
  (sessionId: string) => ({
    payload: { lastStop: Date.now() },
    meta: { sessionId },
  }),
);

export const updateLastFetch = createAction(
  "session/updateLastFetch",
  (sessionId: string) => ({
    payload: { lastFetch: Date.now() },
    meta: { sessionId },
  }),
);
