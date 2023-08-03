import BaseSession, { BaseSessionState } from "./debugSessions/BaseSession";
import DefaultSession from "./debugSessions/default/DefaultSession";
import { AnyAction, Reducer, UnsubscribeListener, addListener, combineReducers, createAction, createReducer } from "@reduxjs/toolkit";
import { AppAddListener, AppListenerMiddlewareInstance, appListenerMiddleware, appStartListening } from "../../listenerMiddleware";
import { StoreState, staticReducer, store } from "../../store";
import { addSession, removeSession } from "./sessionsSlice";
import PythonSession from "./debugSessions/python/PythonSession";
import { messageController, vscode } from "../../util";
import { VsCodeMessage } from "shared";
import { sessionsAdapter } from "./entities";
import { startStateChangedListener } from "../../stateChangeListener";

const sessionByDebugType: Record<string, new (id: string, initialState?: any) => BaseSession> = {
  python: PythonSession,
  default: DefaultSession,
};

export const sessionsInitialized = createAction("session/initialized");

class SessionManager {
  private _sessions = [] as BaseSession[];

  private _listenerUnsubscribersMap = new Map<string, UnsubscribeListener[]>();

  private _reducersMap = new Map<string, Reducer>();

  private _createSession(sessionId: string, type: string, initialState?: unknown): BaseSession {
    console.log(`creating ${type} session: ${sessionId}`);
    const SessionClass = sessionByDebugType[type]
      ? sessionByDebugType[type]
      : sessionByDebugType["default"];

    const session = new SessionClass(sessionId, initialState);
    this._sessions.push(session);

    // higher order reducer that matches session id before running the session's reducer
    const reducerWithIdMatcher = createReducer(session.initialState, (builder) => {
      builder.addMatcher(
        (action: AnyAction) => action.meta?.sessionId === session.id, session.reducer
      );
    });
    this._reducersMap.set(session.id, reducerWithIdMatcher);

    return session;
  }

  private _addSessionListeners(session: BaseSession) {
    // add listeners and save unsubscribers for a session
    const addListenerActions = session.addListeners(addListener as AppAddListener);
    const unsubscribers = [];
    for (const addListenerAction of addListenerActions) {
      console.log(addListenerAction);
      unsubscribers.push(store.dispatch(addListenerAction));
    }
    this._listenerUnsubscribersMap.set(session.id, unsubscribers);
  }

  private _removeSession(sessionId: string) {
    this._sessions = this._sessions.filter(
      (session) => session.id !== sessionId
    );

    // delete reducer
    this._reducersMap.delete(sessionId);

    // stop listeners
    const unsubscribers = this._listenerUnsubscribersMap.get(sessionId);
    unsubscribers?.forEach((unsub) => unsub({ cancelActive: true }));
    this._listenerUnsubscribersMap.delete(sessionId);
  }

  private _getCombinedReducer() {
    return combineReducers<StoreState>({
      ...staticReducer,
      ...Object.fromEntries(this._reducersMap),
    });
  }

  private _updateReducer() {
    store.replaceReducer(this._getCombinedReducer());
  }

  startListeners() {
    appStartListening({
      actionCreator: addSession,
      effect: (action) => {
        const session = this._createSession(
          action.payload.session.id,
          action.payload.session.type,
        );
        this._addSessionListeners(session);
        this._updateReducer();
      },
    });
    appStartListening({
      actionCreator: removeSession,
      effect: (action) => {
        this._removeSession(action.payload.sessionId);
        this._updateReducer();
      },
    });
    this._sessions.forEach((session) => this._addSessionListeners(session));
    startStateChangedListener(appListenerMiddleware as AppListenerMiddlewareInstance);
  }

  getSessionComponent(sessionId: string) {
    const session = this._sessions.find((s) => s.id === sessionId);
    return session ? session.component : null;
  }

  async initialize(): Promise<{ reducer: Reducer<StoreState>, initialState: StoreState | undefined }> {
    // NOTE: vscode.getState() ONLY works so long as the webview is not destroyed.
    // It works after moving the webview tab, but not after closing it.
    const persistedState = vscode.getState() as StoreState | undefined;

    const resp = await messageController.postRequestAndWaitAsync({
      type: "getAllSessionsRequest",
      data: undefined,
    }, 3000) as VsCodeMessage<"getAllSessionsResponse">;

    const activeSessionId = resp.data.activeSessionId;
    const currentSessions = resp.data.sessions;

    for (const currentSession of currentSessions) {
      const initialSessionState: BaseSessionState | undefined = persistedState
        ? {
          ...currentSession,
          ...persistedState[currentSession.id],
        }
        : undefined;
      this._createSession(currentSession.id, currentSession.type, initialSessionState);
    }

    if (persistedState) {
      persistedState.sessions.currentSessionId = activeSessionId;
      sessionsAdapter.setAll(persistedState.sessions.sessions, currentSessions);
    }

    return {
      reducer: this._getCombinedReducer(),
      initialState: persistedState,
    };
  }

  postInitialize() {
    // start listeners and actions that we couldn't do without having the store first
    console.log("post-initialize");
    this.startListeners();
    store.dispatch(sessionsInitialized());
  }
}

const sessionManager = new SessionManager();
export default sessionManager;
