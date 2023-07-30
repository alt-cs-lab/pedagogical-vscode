import BaseSession from "./debugSessions/BaseSession";
import DefaultSession from "./debugSessions/default/DefaultSession";
import { AnyAction, Reducer, UnsubscribeListener, addListener, combineReducers, createReducer } from "@reduxjs/toolkit";
import { AppAddListener, appStartListening } from "../../listenerMiddleware";
import { staticReducer, store } from "../../store";
import { addSession, removeSession } from "./sessionsSlice";
import PythonSession from "./debugSessions/python/PythonSession";

const sessionByDebugType: Record<string, new (id: string) => BaseSession> = {
  python: PythonSession,
  default: DefaultSession,
};

class SessionManager {
  private _sessions = [] as BaseSession[];

  private _listenerUnsubscribersMap = new Map<string, UnsubscribeListener[]>();

  private _reducersMap = new Map<string, Reducer>();

  createSession(sessionId: string, type: string) {
    console.log(`creating ${type} session: ${sessionId}`);
    const SessionClass = sessionByDebugType[type]
      ? sessionByDebugType[type]
      : sessionByDebugType["default"];

    const session = new SessionClass(sessionId);
    this._sessions.push(session);

    const reducerWithIdMatcher = createReducer(session.initialState, (builder) => {
      builder.addMatcher(
        (action: AnyAction) => action.meta?.sessionId === session.id, session.reducer
      );
    });
    this._reducersMap.set(session.id, reducerWithIdMatcher);

    // add listeners and save unsubscribers
    const addListenerActions = session.addListeners(
      addListener as AppAddListener
    );
    const unsubscribers = [];
    for (const addListenerAction of addListenerActions) {
      console.log(addListenerAction);
      unsubscribers.push(store.dispatch(addListenerAction));
    }
    this._listenerUnsubscribersMap.set(sessionId, unsubscribers);

    this.updateReducer();
  }

  removeSession(sessionId: string) {
    this._sessions = this._sessions.filter(
      (session) => session.id !== sessionId
    );

    // delete reducer
    this._reducersMap.delete(sessionId);

    // stop listeners
    const unsubscribers = this._listenerUnsubscribersMap.get(sessionId);
    unsubscribers?.forEach((unsub) => unsub({ cancelActive: true }));
    this._listenerUnsubscribersMap.delete(sessionId);

    this.updateReducer();
  }

  updateReducer() {
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
          action.payload.session.debugType,
        );
        // store.dispatch(setCurrentSession({ sessionId: action.payload.session.id }));
      },
    });
    appStartListening({
      actionCreator: removeSession,
      effect: (action) => this.removeSession(
        action.payload.sessionId,
      ),
    });
  }

  getSessionComponent(sessionId: string) {
    const session = this._sessions.find((s) => s.id === sessionId);
    return session ? session.component : null;
  }
}

const sessionManager = new SessionManager();
export default sessionManager;
