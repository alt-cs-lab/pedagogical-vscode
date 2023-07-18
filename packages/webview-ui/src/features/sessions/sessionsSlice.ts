import { EntityState, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EdgeEntity, NodeEntity, ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity, edgeSelectors, edgesAdapter, nodeSelectors, nodesAdapter, scopesAdapter, stackFramesAdapter, threadsAdapter, variablesAdapter } from "./entities";
import { EdgeChange, NodeChange, applyEdgeChanges, applyNodeChanges } from "reactflow";

/** PayloadAction that has `sessionId` and `debugType` in its meta property */
export type DebugSessionAction<P = void> = PayloadAction<P, string, { sessionId: string, debugType: string }>;

export type SessionsState = Record<string, Session>;

export type Session = {
  name: string;
  debugType: string;
  id: string;
  threads: EntityState<ThreadEntity>;
  stackFrames: EntityState<StackFrameEntity>;
  scopes: EntityState<ScopeEntity>;
  variables: EntityState<VariablesEntity>;
  nodes: EntityState<NodeEntity>;
  edges: EntityState<EdgeEntity>;
};

const initialState: SessionsState = {};

export type SetAllDebugObjectsPayload = {
  threads: ThreadEntity[],
  stackFrames: StackFrameEntity[],
  scopes: ScopeEntity[],
  variables: VariablesEntity[],
};

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    debuggerPaused: {
      reducer: (_state, _action: DebugSessionAction<void>) => undefined,
      prepare(sessionId: string, debugType: string) {
        return { payload: undefined, meta: { sessionId, debugType } };
      }
    },

    buildFlow: {
      reducer: (_state, _action: DebugSessionAction<void>) => undefined,
      prepare(sessionId: string, debugType: string) {
        return { payload: undefined, meta: { sessionId, debugType } };
      }
    },

    addSession: {
      reducer(state, action: DebugSessionAction<{ id: string, name: string, type: string }>) {
        state[action.payload.id] = {
          id: action.payload.id,
          name: action.payload.name,
          debugType: action.payload.type,
          threads: threadsAdapter.getInitialState(),
          stackFrames: stackFramesAdapter.getInitialState(),
          scopes: scopesAdapter.getInitialState(),
          variables: variablesAdapter.getInitialState(),
          nodes: nodesAdapter.getInitialState(),
          edges: edgesAdapter.getInitialState(),
        };
      },
      prepare(payload: { id: string, name: string, type: string }) {
        return { payload, meta: { sessionId: payload.id, debugType: payload.type } };
      }
    },

    setAllDebugObjects: {
      reducer(state, action: DebugSessionAction<SetAllDebugObjectsPayload>) {
        const session = state[action.meta.sessionId];
        threadsAdapter.setAll(session.threads, action.payload.threads);
        stackFramesAdapter.setAll(session.stackFrames, action.payload.stackFrames);
        scopesAdapter.setAll(session.scopes, action.payload.scopes);
        variablesAdapter.setAll(session.variables, action.payload.variables);
      },
      prepare(sessionId: string, debugType: string, payload: SetAllDebugObjectsPayload) {
        return { payload, meta: { sessionId, debugType } };
      }
    },

    setAllFlowObjects: {
      reducer(state, action: DebugSessionAction<{ nodes: NodeEntity[], edges: EdgeEntity[] }>) {
        const session = state[action.meta.sessionId];
        nodesAdapter.setAll(session.nodes, action.payload.nodes);
        edgesAdapter.setAll(session.edges, action.payload.edges);
      },
      prepare(sessionId: string, debugType: string, payload: { nodes: NodeEntity[], edges: EdgeEntity[] }) {
        return { payload, meta: { sessionId, debugType } };
      }
    },

    nodesChanged: (state, action: PayloadAction<{ sessionId: string, changes: NodeChange[] }>) => {
      const session = state[action.payload.sessionId];
      const updatedNodes = applyNodeChanges(action.payload.changes, nodeSelectors.selectAll(session));
      nodesAdapter.setAll(session.nodes, updatedNodes as NodeEntity[]);
    },

    edgesChanged: (state, action: PayloadAction<{ sessionId: string, changes: EdgeChange[] }>) => {
      const session = state[action.payload.sessionId];
      const updatedEdges = applyEdgeChanges(action.payload.changes, edgeSelectors.selectAll(session));
      edgesAdapter.setAll(session.edges, updatedEdges as EdgeEntity[]);
    },

    removeSession: {
      reducer(state, action: DebugSessionAction<void>) {
        delete state[action.meta.sessionId];
      },
      prepare(sessionId: string, debugType: string) {
        return { payload: undefined, meta: { sessionId, debugType } };
      }
    },
  },
});

export const {
  addSession,
  buildFlow,
  setAllDebugObjects,
  setAllFlowObjects,
  removeSession,
  debuggerPaused,
  nodesChanged,
  edgesChanged,
} = sessionsSlice.actions;
