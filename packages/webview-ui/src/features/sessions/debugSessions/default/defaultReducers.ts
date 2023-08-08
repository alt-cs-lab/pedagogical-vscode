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

export const nodesChangedReducer: CR<typeof defaultActions.nodesChanged> = (state, action) => {
  const changedNodes = applyNodeChanges(action.payload.changes, nodeSelectors.selectAll(state.nodes));
  nodesAdapter.setAll(state.nodes, changedNodes as PedagogNode[]);
};

export const updateLastStopReducer: CR<typeof defaultActions.updateLastPause> = (state, action) => {
  state.lastPause = action.payload.lastPause;
};

export const updateLastFetchReducer: CR<typeof defaultActions.updateLastFetch> = (state, action) => {
  state.lastFetch = action.payload.lastFetch;
};
