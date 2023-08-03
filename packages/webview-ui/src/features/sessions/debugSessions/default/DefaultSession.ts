import BaseSession, { BaseSessionState } from "../BaseSession";
import { createReducer } from "@reduxjs/toolkit";
import * as defaultActions from "./defaultActions";
import * as defaultReducers from "./defaultReducers";
import { AppAddListener, AppListenerEffect } from "../../../../listenerMiddleware";
import { matcherWithId } from "../../sessionMatchers";
import defaultStrategies from "./strategies";
import { getDefaultFlowComponent } from "./DefaultFlowComponent";
import { debugEventAction } from "../../debugEventActions";
import { sessionsInitialized } from "../../sessionManager";

export default class DefaultSession extends BaseSession {
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
    builder.addCase(defaultActions.updateLastPause, (state, action) => {
      state.lastPause = action.payload.lastPause;
    });
    builder.addCase(defaultActions.updateLastFetch, (state, action) => {
      state.lastFetch = action.payload.lastFetch;
    });
  });

  override component = getDefaultFlowComponent();

  override addListeners = (addListener: AppAddListener) => [
    addListener({
      predicate: (action) => sessionsInitialized.match(action) && this.fetchAfterInitialize,
      effect: (act, api) => this.debuggerStoppedEffect(act, api),
    }),

    addListener({
      matcher: matcherWithId(this.id, debugEventAction.stopped.match),
      effect: (act, api) => this.debuggerStoppedEffect(act, api),
    }),

    addListener({
      matcher: matcherWithId(this.id, defaultActions.buildFlow.match),
      effect: (act, api) => this.buildFlowEffect(act, api),
    }),
  ];

  constructor(id: string, initialState?: BaseSessionState) {
    super(id, initialState);
    if (this.initialState.lastPause > this.initialState.lastFetch) {
      this.fetchAfterInitialize = true;
    }
  }

  strategies = defaultStrategies;

  //#region listener effects
  debuggerStoppedEffect: AppListenerEffect = async (_action, api) => {
    api.dispatch(defaultActions.updateLastPause(this.id));
    const payload = await this.strategies.fetchSession(this.id, this.strategies);
    api.dispatch(defaultActions.updateLastFetch(this.id));
    api.dispatch(defaultActions.setAllDebugObjects(this.id, payload));
    api.dispatch(defaultActions.buildFlow(this.id));
  };

  buildFlowEffect: AppListenerEffect = async (_action, api) => {
    const state = api.getState()[this.id] as BaseSessionState;
    const { nodes, edges } = await this.strategies.buildFlow(state);
    api.dispatch(defaultActions.setAllFlowObjects(this.id, { nodes, edges }));
  };
  //#endregion listener effects
}
