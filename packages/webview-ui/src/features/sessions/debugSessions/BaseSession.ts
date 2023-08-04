import { FunctionComponent } from "react";
import { EntityState, Reducer } from "@reduxjs/toolkit";
import { AppAddListener } from "../../../listenerMiddleware";
import { ThreadEntity, StackFrameEntity, ScopeEntity, VariablesEntity, NodeEntity, EdgeEntity, edgesAdapter, nodesAdapter, scopesAdapter, stackFramesAdapter, threadsAdapter, variablesAdapter } from "../entities";

export type BaseSessionState = {
  name: string;
  threads: EntityState<ThreadEntity>;
  stackFrames: EntityState<StackFrameEntity>;
  scopes: EntityState<ScopeEntity>;
  variables: EntityState<VariablesEntity>;
  nodes: EntityState<NodeEntity>;
  edges: EntityState<EdgeEntity>;
  lastPause: number;
  lastFetch: number;
};

export default abstract class BaseSession {
  /**
   * The id of the debug session, given by vscode.
   * This is used as a key in the redux state.
   */
  readonly id: string;

  /**
   * The initial state of a session.
   * This will be added to the root state as the value corresponding to the session id.
   */
  readonly initialState: BaseSessionState = {
    name: "",
    threads: threadsAdapter.getInitialState(),
    stackFrames: stackFramesAdapter.getInitialState(),
    scopes: scopesAdapter.getInitialState(),
    variables: variablesAdapter.getInitialState(),
    nodes: nodesAdapter.getInitialState(),
    edges: edgesAdapter.getInitialState(),
    lastPause: 0,
    lastFetch: 0,
  };

  /**
   * Whether this session should be fetched after initialization is complete
   */
  fetchAfterInitialize = false;

  /**
   * The reducer to use for a session.
   * The inital state of the reducer should be the same as the one defined in this class.
   *
   * This reducer will only run if the action includes a matching `sessionId` in its `meta` property.
   * You can not reduce based on actions for other sessions. If you need to do that for some reason,
   * use a listener.
   */
  abstract reducer: Reducer;

  /**
   * The react component that will be rendered whenever the debug session is active.
   * It should only accept a `sessionId` in its `props`.
   *
   * **Important:** If this value references another function, wrap it in an anonymous function.
   * This lets the session manager treat the function component as a unique function.
   * Otherwise, if two sessions share the same function reference, it may cause issues when
   * switching between them.
   *
   * @example
   * // wrong!
   * component = DefaultFlowComponent;
   *
   * // correct!
   * component = (props: { sessionId: string }) => DefaultFlowComponent(props);
   */
  abstract component: FunctionComponent<{ sessionId: string }>;

  /**
   * Returns a list of `addListener` actions that will be dispatched by the session manager.
   *
   * Due to limitations, this works a bit differently from the session's reducer.
   * By default, each listener will trigger if an action matches, even if the action is for
   * another session.
   *
   * To only listen for actions that correspond to this session, check the `sessionId` in the
   * `meta` property of an action. The convenience function `matcherWithId(id, matcher) does this
   * while keeping the matcher's type guard.
   *
   * The session manager will unsubscribe the listeners when the session is removed.
   *
   * @param addListener The `addListener` function for the app's listener middleware
   */
  abstract addListeners(addListener: AppAddListener): ReturnType<AppAddListener>[];

  /**
   * The constructor that the session manager will use. Only accepts an id for the debug session.
   *
   * @param id debug session id given by vscode
   */
  constructor(id: string, preloadedState?: Partial<BaseSessionState>) {
    this.id = id;
    if (preloadedState) {
      this.initialState = {
        ...this.initialState,
        ...preloadedState,
      };
    }
  }
}
