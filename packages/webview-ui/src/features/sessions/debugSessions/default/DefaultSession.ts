import BaseSession from "../BaseSession";
import { createReducer } from "@reduxjs/toolkit";
import {
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
import { matcherWithId } from "../sessionMatchers";
import defaultStrategies from "./strategies";
import DefaultComponent from "./DefaultComponent";
import { debugEventAction } from "../../debugEventActions";

export type DefaultSessionState = DefaultSession["initialState"];

export default class DefaultSession extends BaseSession {
  readonly initialState = {
    name: "",
    threads: threadsAdapter.getInitialState(),
    stackFrames: stackFramesAdapter.getInitialState(),
    scopes: scopesAdapter.getInitialState(),
    variables: variablesAdapter.getInitialState(),
    nodes: nodesAdapter.getInitialState(),
    edges: edgesAdapter.getInitialState(),
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
  });

  override component = DefaultComponent;

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

  constructor(id: string) {
    super(id);
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
