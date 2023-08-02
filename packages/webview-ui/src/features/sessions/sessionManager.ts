import BaseSession from "./debugSessions/BaseSession";
import DefaultSession from "./debugSessions/default/DefaultSession";
import { AnyAction, Reducer, UnsubscribeListener, addListener, combineReducers, createAction, createReducer } from "@reduxjs/toolkit";
import { AppAddListener, appStartListening } from "../../listenerMiddleware";
import { RootState, staticReducer, store } from "../../store";
import { addSession, removeSession, setAllSessions } from "./sessionsSlice";
import PythonSession from "./debugSessions/python/PythonSession";
import { messageController, vscode } from "../../util";
import { VsCodeMessage } from "shared";

const sessionByDebugType: Record<string, new (id: string, initialState?: any) => BaseSession> = {
  python: PythonSession,
  default: DefaultSession,
};

export const sessionsInitialized = createAction("session/initialized");

class SessionManager {
  private _sessions = [] as BaseSession[];

  private _listenerUnsubscribersMap = new Map<string, UnsubscribeListener[]>();

  private _reducersMap = new Map<string, Reducer>();

  private createSession(sessionId: string, type: string, initialState?: unknown) {
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

    // add listeners and save unsubscribers
    const addListenerActions = session.addListeners(addListener as AppAddListener);
    const unsubscribers = [];
    for (const addListenerAction of addListenerActions) {
      console.log(addListenerAction);
      unsubscribers.push(store.dispatch(addListenerAction));
    }
    this._listenerUnsubscribersMap.set(sessionId, unsubscribers);
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

  private _updateReducer() {
    const reducer = {
      ...staticReducer,
      ...Object.fromEntries(this._reducersMap),
    };
    store.replaceReducer(combineReducers(reducer));
  }

  startListeners() {
    appStartListening({
      actionCreator: addSession,
      effect: (action) => {
        this.createSession(
          action.payload.session.id,
          action.payload.session.type,
        );
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
  }

  getSessionComponent(sessionId: string) {
    const session = this._sessions.find((s) => s.id === sessionId);
    return session ? session.component : null;
  }

  async initialize() {
    const persistedState = vscode.getState() as RootState | undefined;
    const currentSessionsResp = await messageController.postRequestAndWaitAsync({
      type: "getAllSessionsRequest",
      data: undefined,
    }) as VsCodeMessage<"getAllSessionsResponse">;

    for (const currentSession of currentSessionsResp.data.sessions) {
      const initSessionState = persistedState ? persistedState[currentSession.id] : undefined;
      this.createSession(currentSession.id, currentSession.type, initSessionState);
    }

    this._updateReducer();
    store.dispatch(setAllSessions({
      sessions: currentSessionsResp.data.sessions,
      currentSessionId: currentSessionsResp.data.activeSessionId
    }));
    store.dispatch(sessionsInitialized());
  }
}

const sessionManager = new SessionManager();
export default sessionManager;
