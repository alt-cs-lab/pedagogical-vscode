import { ActionCreator, AnyAction, CaseReducer } from "@reduxjs/toolkit";
import * as defaultActions from "./defaultActions";
import { threadsAdapter, stackFramesAdapter, scopesAdapter, variablesAdapter, edgesAdapter, nodesAdapter, nodeSelectors } from "../../entities";
import { applyNodeChanges } from "reactflow";
import { PedagogNode } from "../../../../components/nodes";
import { BaseSessionState } from "../BaseSession";

/** case reducer for an action creator */
type CR<A extends ActionCreator<AnyAction>> = CaseReducer<
  BaseSessionState,
  ReturnType<A>
>;

export const setAllDebugObjectsReducer: CR<typeof defaultActions.setAllDebugObjects> = (state, action) => {
  threadsAdapter.setAll(state.threads, action.payload.threads);
  stackFramesAdapter.setAll(state.stackFrames, action.payload.stackFrames);
  scopesAdapter.setAll(state.scopes, action.payload.scopes);
  variablesAdapter.setAll(state.variables, action.payload.variables);
};

export const setAllFlowObjectsReducer: CR<typeof defaultActions.setAllFlowObjects> = (state, action) => {
  nodesAdapter.setAll(state.nodes, action.payload.nodes);
  edgesAdapter.setAll(state.edges, action.payload.edges);
};

export const setLoadingReducer: CR<typeof defaultActions.setLoading> = (state, action) => {
  state.loading = action.payload.loading;
};

export const nodesChangedReducer: CR<typeof defaultActions.nodesChanged> = (state, action) => {
  const changedNodes = applyNodeChanges(action.payload.changes, nodeSelectors.selectAll(state.nodes));
  nodesAdapter.setAll(state.nodes, changedNodes as PedagogNode[]);
};

export const layoutNodesDoneReducer: CR<typeof defaultActions.layoutNodesDone> = (state, action) => {
  const changedNodes = applyNodeChanges(action.payload.changes, nodeSelectors.selectAll(state.nodes)) as PedagogNode[];
  
  // set isLayouted before setting node state
  // can't add properties to the changed node so we need to copy it first with map
  nodesAdapter.setAll(state.nodes, changedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isLayouted: true,
    }
  })));
};

export const updateLastStopReducer: CR<typeof defaultActions.updateLastPause> = (state, action) => {
  state.lastPause = action.payload.lastPause;
};

export const updateLastFetchReducer: CR<typeof defaultActions.updateLastFetch> = (state, action) => {
  state.lastFetch = action.payload.lastFetch;
};
