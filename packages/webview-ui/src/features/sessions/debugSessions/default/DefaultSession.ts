import BaseSession, { BaseSessionState } from "../BaseSession";
import { createReducer } from "@reduxjs/toolkit";
import * as defaultActions from "./defaultActions";
import * as defaultReducers from "./defaultReducers";
import { AppAddListener, AppListenerEffect } from "../../../../listenerMiddleware";
import { matcherWithId } from "../../sessionMatchers";
import defaultStrategies from "./strategies";
import { getDefaultFlowComponent } from "./DefaultFlowComponent";
import { debugEventAction } from "../../debugEventActions";
import { sessionsInitialized } from "../../sessionsSlice";
import { SessionEntity } from "../../entities";
import { MessageBox } from "../../../../util";

export default class DefaultSession extends BaseSession {
  override reducer = createReducer(this.initialState, (builder) => {
    // set/remove all debug adapter objects
    builder.addCase(defaultActions.setAllDebugObjects, defaultReducers.setAllDebugObjectsReducer);
    builder.addCase(
      defaultActions.removeAllDebugObjects,
      defaultReducers.removeAllDebugObjectsReducer,
    );

    // add individual debug adapter objects
    builder.addCase(defaultActions.addThreads, defaultReducers.addThreadsReducer);
    builder.addCase(defaultActions.addStackFrames, defaultReducers.addStackFramesReducer);
    builder.addCase(defaultActions.addScopes, defaultReducers.addScopesReducer);
    builder.addCase(defaultActions.addVariables, defaultReducers.addVariablesReducer);

    // set all react flow objects
    builder.addCase(defaultActions.setAllFlowObjects, defaultReducers.setAllFlowObjectsReducer);

    // apply node changes from react flow
    builder.addCase(defaultActions.nodesChanged, defaultReducers.nodesChangedReducer);
    builder.addCase(defaultActions.layoutNodesDone, defaultReducers.layoutNodesDoneReducer);
    builder.addCase(defaultActions.nodeMeasured, defaultReducers.nodeMeasuredReducer);

    builder.addCase(defaultActions.setLoading, defaultReducers.setLoadingReducer);

    // update last stop and last fetch
    builder.addCase(defaultActions.updateLastPause, defaultReducers.updateLastStopReducer);
    builder.addCase(defaultActions.updateLastFetch, defaultReducers.updateLastFetchReducer);
  });

  override component = getDefaultFlowComponent();

  override addListeners = (addListener: AppAddListener) => [
    // sessionsInitialized
    addListener({
      predicate: (action) => sessionsInitialized.match(action) && this.fetchAfterInitialize,
      effect: (act, api) => this.debuggerStoppedEffect(act, api),
    }),

    // "stopped" debug event
    addListener({
      matcher: matcherWithId(this.id, debugEventAction.stopped.match),
      effect: (act, api) => this.debuggerStoppedEffect(act, api),
    }),

    // buildFLow
    addListener({
      matcher: matcherWithId(this.id, defaultActions.buildFlow.match),
      effect: (act, api) => this.buildFlowEffect(act, api),
    }),

    // layoutNodes
    addListener({
      matcher: matcherWithId(this.id, defaultActions.layoutNodes.match),
      effect: (act, api) => this.layoutNodesEffect(act, api),
    }),

    // nodeMeasured
    addListener({
      matcher: matcherWithId(this.id, defaultActions.nodeMeasured.match),
      effect: (act, api) => this.nodeMeasuredEffect(act, api),
    }),
  ];

  constructor(sessionEntity: SessionEntity, initialState?: BaseSessionState) {
    super(sessionEntity, initialState);
    if (this.initialState.lastPause > this.initialState.lastFetch) {
      this.fetchAfterInitialize = true;
    }
  }

  strategies = defaultStrategies;

  //#region listener effects
  /**
   * When the debugger stops, dispatch all actions needed to clear the debug objects,
   * fetch new objects from the debug adapter, then build the nodes and edges for React Flow.
   */
  debuggerStoppedEffect: AppListenerEffect = async (action, api) => {
    api.dispatch(defaultActions.updateLastPause(this.id));
    api.dispatch(defaultActions.removeAllDebugObjects(this.id));

    const stoppedThread = debugEventAction.stopped.match(action)
      ? action.payload.body.threadId
      : undefined;

    api.dispatch(defaultActions.setLoading(this.id, { loading: true }));

    try {
      await api.pause(this.strategies.fetchSession(this.id, this.strategies, api, stoppedThread));
    } catch (e) {
      if (api.signal.aborted) {
        // Don't show error message if listener was intentionally cancelled
        return;
      }
      console.error(e);
      MessageBox.showError(
        "An error occured while fetching the debug state. The flowchart shown may be missing or incomplete.",
      );
    }

    api.dispatch(defaultActions.buildFlow(this.id));
    api.dispatch(defaultActions.setLoading(this.id, { loading: false }));
  };

  /**
   * Async handler for the `buildFlow` action.
   *
   * TODO: This is basically an async reducer, so it could probably be a thunk.
   */
  buildFlowEffect: AppListenerEffect = async (_action, api) => {
    const state = api.getState().sessions.sessionStates[this.id];
    const { nodes, edges } = await api.pause(this.strategies.buildFlow(state));
    api.dispatch(defaultActions.setAllFlowObjects(this.id, { nodes, edges }));
  };

  /**
   * Async handler for the `layoutFlow` action.
   *
   * TODO: This is basically an async reducer, so it could probably be a thunk.
   */
  layoutNodesEffect: AppListenerEffect = async (_action, api) => {
    api.cancelActiveListeners();
    const state = api.getState().sessions.sessionStates[this.id];
    const changes = await api.pause(this.strategies.layoutFlow(state));
    api.dispatch(defaultActions.layoutNodesDone(this.id, { changes }));
  };

  /**
   * Effect that dispatches `layoutNodes` after receiving the batched `nodeMeasured` actions.
   */
  nodeMeasuredEffect: AppListenerEffect = async (_action, api) => {
    api.cancelActiveListeners();
    // This effect is triggered several times at once.
    // Debounce to make sure this listener code only runs once.
    await api.delay(10);

    api.dispatch(defaultActions.layoutNodes(this.id));
  };
  //#endregion listener effects
}
