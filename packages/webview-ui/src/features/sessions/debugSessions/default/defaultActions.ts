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
export const setAllDebugObjects = createSessionAction<SetAllDebugObjectsPayload>("session/setAllDebugObjects");

export const removeAllDebugObjects = createSessionAction("session/removeAllDebugObjects");

export const addThreads = createSessionAction<{ threads: ThreadEntity[] }>("session/addThreads");
export const addStackFrames = createSessionAction<{ threadId: number, stackFrames: StackFrameEntity[] }>("session/addStackFrames");
export const addScopes = createSessionAction<{ frameId: number, scopes: ScopeEntity[] }>("session/addScopes");
export const addVariables = createSessionAction<{ variables: VariablesEntity[] }>("session/addVariables");

type SetAllFlowObjectsPayload = {
  nodes: NodeEntity[];
  edges: EdgeEntity[];
};
export const setAllFlowObjects = createSessionAction<SetAllFlowObjectsPayload>("session/setAllFlowObjects");

export const setLoading = createSessionAction<{ loading: boolean }>("session/setLoading");

export const buildFlow = createSessionAction("session/buildFlow");
export const layoutNodes = createSessionAction("session/layoutNodes");

export const layoutNodesDone = createSessionAction<{ changes: NodeChange[] }>("session/layoutNodesDone");
export const nodesChanged = createSessionAction<{ changes: NodeChange[] }>("session/nodesChanged");

export const updateLastPause = createAction(
  "session/updateLastPause",
  (sessionId: string) => ({
    payload: { lastPause: Date.now() },
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
