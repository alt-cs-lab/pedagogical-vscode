import BaseSession, { BaseSessionState } from "./debugSessions/BaseSession";
import DefaultSession from "./debugSessions/default/DefaultSession";
import { AnyAction, Reducer, UnsubscribeListener, addListener, combineReducers, createAction, createReducer } from "@reduxjs/toolkit";
import { AppAddListener, AppListenerMiddlewareInstance, appListenerMiddleware, appStartListening } from "../../listenerMiddleware";
import { store } from "../../store";
import { addSession, removeSession, setAllSessions } from "./sessionsSlice";
import PythonSession from "./debugSessions/python/PythonSession";
import { messageController, vscode } from "../../util";
import { VsCodeMessage } from "shared";
import { startStateChangedListener } from "../../stateChangeListener";

type BaseSessionCtor = new (id: string, preloadedState?: any) => BaseSession;

const sessionClassByDebugType: Record<string, BaseSessionCtor> = {
  python: PythonSession,
  default: DefaultSession,
};

export function getSessionClassByDebugType(debugType: string): BaseSessionCtor {
  return sessionClassByDebugType[
    Object.hasOwn(sessionClassByDebugType, debugType) ? debugType : "default"
  ];
}

export const sessionsInitialized = createAction("session/initialized");

class SessionManager {
  sessions = [] as BaseSession[];

  private _listenerUnsubscribersMap = new Map<string, UnsubscribeListener[]>();

  private _getAllSessionsResp: VsCodeMessage<"getAllSessionsResponse"> | undefined;

  createSession(sessionId: string, type: string, preloadedState?: Partial<BaseSessionState>): BaseSession {
    console.log(`creating ${type} session: ${sessionId}`);
    const SessionClass = getSessionClassByDebugType(type);

    const session = new SessionClass(sessionId, preloadedState);
    this.sessions.push(session);

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
    this.sessions = this.sessions.filter(
      (session) => session.id !== sessionId
    );

    // stop listeners
    const unsubscribers = this._listenerUnsubscribersMap.get(sessionId);
    unsubscribers?.forEach((unsub) => unsub({ cancelActive: true }));
    this._listenerUnsubscribersMap.delete(sessionId);
  }

  startListeners() {
    appStartListening({
      actionCreator: addSession,
      effect: (action) => {
        const session = this.createSession(
          action.payload.sessionEntity.id,
          action.payload.sessionEntity.type,
        );
        this._addSessionListeners(session);
      },
    });
    appStartListening({
      actionCreator: removeSession,
      effect: (action) => {
        this._removeSession(action.payload.sessionId);
      },
    });
    this.sessions.forEach((session) => this._addSessionListeners(session));
    startStateChangedListener(appListenerMiddleware as AppListenerMiddlewareInstance);
  }

  getSessionComponent(sessionId: string) {
    const session = this.sessions.find((s) => s.id === sessionId);
    return session ? session.component : null;
  }

  async initialize() {
    // get debug sessions from vscode
    // add/update/remove existing session states

    const resp = await messageController.postRequestAndWaitAsync({
      type: "getAllSessionsRequest",
      data: undefined,
    }, 3000) as VsCodeMessage<"getAllSessionsResponse">;

    this._getAllSessionsResp = resp;
    const currentSessions = resp.data.sessions;
  }

  // async initialize(): Promise<{ reducer: Reducer<StoreState>, initialState: StoreState | undefined }> {
  //   // NOTE: vscode.getState() ONLY works so long as the webview is not destroyed.
  //   // It works after moving the webview tab, but not after closing it.
  //   const persistedState = vscode.getState() as StoreState | undefined;

  //   const resp = await messageController.postRequestAndWaitAsync({
  //     type: "getAllSessionsRequest",
  //     data: undefined,
  //   }, 3000) as VsCodeMessage<"getAllSessionsResponse">;

  //   this._getAllSessionsResp = resp;
  //   const currentSessions = resp.data.sessions;

  //   for (const currentSession of currentSessions) {
  //     const initialSessionState: Partial<BaseSessionState> = {
  //       ...persistedState ? persistedState[currentSession.id] : undefined,
  //       ...currentSession,
  //     };
  //     this._createSession(currentSession.id, currentSession.type, initialSessionState);
  //   }

  //   return {
  //     reducer: this._getCombinedReducer(),
  //     initialState: persistedState,
  //   };
  // }

  // async postInitialize() {
  //   // start listeners and actions that we couldn't do without having the store first
  //   this.startListeners();
  //   if (this._getAllSessionsResp) {
  //     store.dispatch(setAllSessions({
  //       sessions: this._getAllSessionsResp.data.sessions,
  //       currentSessionId: this._getAllSessionsResp.data.activeSessionId,
  //     }));
  //   }
  //   store.dispatch(sessionsInitialized());
  // }
}

const sessionManager = new SessionManager();
export default sessionManager;
