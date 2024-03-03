import { ActionCreator, AnyAction, CaseReducer } from "@reduxjs/toolkit";
import * as defaultActions from "./defaultActions";
import {
  threadsAdapter,
  stackFramesAdapter,
  scopesAdapter,
  variablesAdapter,
  edgesAdapter,
  nodesAdapter,
  nodeSelectors,
} from "../../entities";
import { applyNodeChanges } from "reactflow";
import { PedagogNode } from "../../../../components/nodes";
import { BaseSessionState } from "../BaseSession";

/** case reducer for an action creator */
type CR<A extends ActionCreator<AnyAction>> = CaseReducer<BaseSessionState, ReturnType<A>>;

export const setAllDebugObjectsReducer: CR<typeof defaultActions.setAllDebugObjects> = (
  state,
  action,
) => {
  threadsAdapter.setAll(state.threads, action.payload.threads);
  stackFramesAdapter.setAll(state.stackFrames, action.payload.stackFrames);
  scopesAdapter.setAll(state.scopes, action.payload.scopes);
  variablesAdapter.setAll(state.variables, action.payload.variables);
};

export const removeAllDebugObjectsReducer: CR<typeof defaultActions.removeAllDebugObjects> = (
  state,
) => {
  threadsAdapter.removeAll(state.threads);
  stackFramesAdapter.removeAll(state.stackFrames);
  scopesAdapter.removeAll(state.scopes);
  variablesAdapter.removeAll(state.variables);
};

export const addThreadsReducer: CR<typeof defaultActions.addThreads> = (state, action) => {
  threadsAdapter.upsertMany(state.threads, action.payload.threads);
};

export const addStackFramesReducer: CR<typeof defaultActions.addStackFrames> = (state, action) => {
  stackFramesAdapter.upsertMany(state.stackFrames, action.payload.stackFrames);
  threadsAdapter.updateOne(state.threads, {
    id: action.payload.threadId,
    changes: { stackFrameIds: action.payload.stackFrames.map((frame) => frame.id) },
  });
};

export const addScopesReducer: CR<typeof defaultActions.addScopes> = (state, action) => {
  scopesAdapter.upsertMany(state.scopes, action.payload.scopes);
  stackFramesAdapter.updateOne(state.stackFrames, {
    id: action.payload.frameId,
    changes: { scopeIds: action.payload.scopes.map((scope) => scope.pedagogId) },
  });
};

export const addVariablesReducer: CR<typeof defaultActions.addVariables> = (state, action) => {
  variablesAdapter.upsertMany(state.variables, action.payload.variables);
};

export const setAllFlowObjectsReducer: CR<typeof defaultActions.setAllFlowObjects> = (
  state,
  action,
) => {
  nodesAdapter.setAll(state.nodes, action.payload.nodes);
  edgesAdapter.setAll(state.edges, action.payload.edges);
};

export const setLoadingReducer: CR<typeof defaultActions.setLoading> = (state, action) => {
  state.loading = action.payload.loading;
};

export const nodesChangedReducer: CR<typeof defaultActions.nodesChanged> = (state, action) => {
  const changedNodes = applyNodeChanges(
    action.payload.changes,
    nodeSelectors.selectAll(state.nodes),
  );
  nodesAdapter.setAll(state.nodes, changedNodes as PedagogNode[]);
};

export const layoutNodesDoneReducer: CR<typeof defaultActions.layoutNodesDone> = (
  state,
  action,
) => {
  const changedNodes = applyNodeChanges(
    action.payload.changes,
    nodeSelectors.selectAll(state.nodes),
  ) as PedagogNode[];

  // set isLayouted before setting node state
  // can't add properties to the changed node so we need to copy it first with map
  nodesAdapter.setAll(
    state.nodes,
    changedNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isLayouted: true,
      },
    })),
  );
};

export const nodeMeasuredReducer: CR<typeof defaultActions.nodeMeasured> = (state, action) => {
  const node = nodeSelectors.selectById(state.nodes, action.payload.id);
  if (node === undefined) {
    return;
  }
  nodesAdapter.updateOne(state.nodes, {
    id: action.payload.id,
    changes: {
      data: {
        ...node.data,
        measuredSize: action.payload.size,
      },
    },
  });
};

export const updateLastStopReducer: CR<typeof defaultActions.updateLastPause> = (state, action) => {
  state.lastPause = action.payload.lastPause;
};

export const updateLastFetchReducer: CR<typeof defaultActions.updateLastFetch> = (
  state,
  action,
) => {
  state.lastFetch = action.payload.lastFetch;
};
