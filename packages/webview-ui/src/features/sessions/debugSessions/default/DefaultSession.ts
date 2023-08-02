import BaseSession from "../BaseSession";
import { EntityState, createReducer } from "@reduxjs/toolkit";
import {
  EdgeEntity,
  NodeEntity,
  ScopeEntity,
  StackFrameEntity,
  ThreadEntity,
  VariablesEntity,
  edgesAdapter,
  nodesAdapter,
  scopesAdapter,
  stackFramesAdapter,
  threadsAdapter,
  variablesAdapter,
} from "../../entities";
import * as defaultActions from "./defaultActions";
import * as defaultReducers from "./defaultReducers";
import { AppAddListener, AppListenerEffect } from "../../../../listenerMiddleware";
import { matcherWithId } from "../../sessionMatchers";
import defaultStrategies from "./strategies";
import { getDefaultFlowComponent } from "./DefaultFlowComponent";
import { debugEventAction } from "../../debugEventActions";

export type DefaultSessionState = {
  name: string;
  threads: EntityState<ThreadEntity>;
  stackFrames: EntityState<StackFrameEntity>;
  scopes: EntityState<ScopeEntity>;
  variables: EntityState<VariablesEntity>;
  nodes: EntityState<NodeEntity>;
  edges: EntityState<EdgeEntity>;
  lastStop: number;
  lastFetch: number;
};

export default class DefaultSession extends BaseSession {
  override readonly initialState: DefaultSessionState = {
    name: "",
    threads: threadsAdapter.getInitialState(),
    stackFrames: stackFramesAdapter.getInitialState(),
    scopes: scopesAdapter.getInitialState(),
    variables: variablesAdapter.getInitialState(),
    nodes: nodesAdapter.getInitialState(),
    edges: edgesAdapter.getInitialState(),
    lastStop: 0,
    lastFetch: 0,
  };

  override reducer = createReducer(this.initialState, (builder) => {
    // set all debug adapter objects
    builder.addCase(
      defaultActions.setAllDebugObjects,
      defaultReducers.setAllDebugObjectsReducer
    );

    // set all react flow objects
    builder.addCase(
      defaultActions.setAllFlowObjects,
      defaultReducers.setAllFlowObjectsReducer,
    );

    // apply node changes from react flow
    builder.addCase(
      defaultActions.nodesChanged,
      defaultReducers.nodesChangedReducer,
    );

    // update last stop and last fetch
    builder.addCase(defaultActions.updateLastStop, (state, action) => {
      state.lastStop = action.payload.lastStop;
    });
    builder.addCase(defaultActions.updateLastFetch, (state, action) => {
      state.lastFetch = action.payload.lastFetch;
    });
  });

  override component = getDefaultFlowComponent();

  override addListeners = (addListener: AppAddListener) => [
    addListener({
      matcher: matcherWithId(this.id, debugEventAction.stopped.match),
      effect: this.debuggerStoppedEffect,
    }),

    addListener({
      matcher: matcherWithId(this.id, defaultActions.buildFlow.match),
      effect: this.buildFlowEffect,
    })
  ];

  constructor(id: string, initialState?: DefaultSessionState) {
    super(id, initialState);
    if (this.initialState.lastStop > this.initialState.lastFetch) {
      // TODO
    }
  }

  strategies = defaultStrategies;

  //#region listener effects
  debuggerStoppedEffect: AppListenerEffect<
    typeof debugEventAction.stopped
  > = async (_action, api) => {
    const payload = await this.strategies.fetchSession(this.id, this.strategies);
    api.dispatch(defaultActions.setAllDebugObjects(this.id, payload));
    api.dispatch(defaultActions.buildFlow(this.id));
  };

  buildFlowEffect: AppListenerEffect<
    typeof defaultActions.buildFlow
  > = async (_action, api) => {
    const state = api.getState()[this.id] satisfies DefaultSessionState;
    const { nodes, edges } = await this.strategies.buildFlow(state);
    api.dispatch(defaultActions.setAllFlowObjects(this.id, { nodes, edges }));
  };
  //#endregion listener effects
}
