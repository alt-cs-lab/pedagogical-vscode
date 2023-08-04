import BaseSession, { BaseSessionState } from "./debugSessions/BaseSession";
import DefaultSession from "./debugSessions/default/DefaultSession";
import { AnyAction, Reducer, UnsubscribeListener, addListener, combineReducers, createAction, createReducer } from "@reduxjs/toolkit";
import { AppAddListener, AppListenerMiddlewareInstance, appListenerMiddleware, appStartListening } from "../../listenerMiddleware";
import { StoreState, staticReducer, store } from "../../store";
import { addSession, removeSession, setAllSessions } from "./sessionsSlice";
import PythonSession from "./debugSessions/python/PythonSession";
import { messageController, vscode } from "../../util";
import { VsCodeMessage } from "shared";
import { startStateChangedListener } from "../../stateChangeListener";

const sessionByDebugType: Record<string, new (id: string, preloadedState?: any) => BaseSession> = {
  python: PythonSession,
  default: DefaultSession,
};

export const sessionsInitialized = createAction("session/initialized");

class SessionManager {
  private _sessions = [] as BaseSession[];

  private _listenerUnsubscribersMap = new Map<string, UnsubscribeListener[]>();

  private _reducersMap = new Map<string, Reducer>();

  private _getAllSessionsResp: VsCodeMessage<"getAllSessionsResponse"> | undefined;

  private _createSession(sessionId: string, type: string, preloadedState?: Partial<BaseSessionState>): BaseSession {
    console.log(`creating ${type} session: ${sessionId}`);
    const SessionClass = sessionByDebugType[type]
      ? sessionByDebugType[type]
      : sessionByDebugType["default"];

    const session = new SessionClass(sessionId, preloadedState);
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

    this._getAllSessionsResp = resp;
    const currentSessions = resp.data.sessions;

    for (const currentSession of currentSessions) {
      const initialSessionState: Partial<BaseSessionState> = {
        ...persistedState ? persistedState[currentSession.id] : undefined,
        ...currentSession,
      };
      this._createSession(currentSession.id, currentSession.type, initialSessionState);
    }

    return {
      reducer: this._getCombinedReducer(),
      initialState: persistedState,
    };
  }

  async postInitialize() {
    // start listeners and actions that we couldn't do without having the store first
    this.startListeners();
    if (this._getAllSessionsResp) {
      store.dispatch(setAllSessions({
        sessions: this._getAllSessionsResp.data.sessions,
        currentSessionId: this._getAllSessionsResp.data.activeSessionId,
      }));
    }
    store.dispatch(sessionsInitialized());
  }
}

const sessionManager = new SessionManager();
export default sessionManager;
