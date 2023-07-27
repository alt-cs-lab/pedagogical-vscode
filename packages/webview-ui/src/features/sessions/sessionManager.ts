import BaseSession from "./debugSessions/BaseSession";
import DefaultSession from "./debugSessions/default/DefaultSession";
import { UnsubscribeListener, addListener, combineReducers } from "@reduxjs/toolkit";
import { AppAddListener, appStartListening } from "../../listenerMiddleware";
import { staticReducer, store } from "../../store";
import { addSession, removeSession } from "./sessionsSlice";

const sessionByDebugType: Record<string, new (id: string) => BaseSession> = {
  default: DefaultSession
};

const sessionManager = {
  sessions: [] as BaseSession[],

  listenerUnsubscribersMap: new Map<string, UnsubscribeListener[]>(),

  createSession(sessionId: string, type: string) {
    console.log(`creating ${type} session: ${sessionId}`);
    const SessionClass = sessionByDebugType[type]
      ? sessionByDebugType[type]
      : sessionByDebugType["default"];
    
    const session = new SessionClass(sessionId);
    this.sessions.push(session);

    // add listeners and save unsubscribers
    const addListenerActions = session.addListeners(
      addListener as AppAddListener
    );
    const unsubscribers = [];
    for (const addListenerAction of addListenerActions) {
      console.log(addListenerAction);
      unsubscribers.push(store.dispatch(addListenerAction));
    }
    this.listenerUnsubscribersMap.set(sessionId, unsubscribers);

    this.updateReducer();
  },

  deleteSession(sessionId: string) {
    this.sessions = this.sessions.filter(
      (session) => session.id !== sessionId
    );

    // stop listeners
    const unsubscribers = this.listenerUnsubscribersMap.get(sessionId);
    unsubscribers?.forEach((unsub) => unsub({ cancelActive: true }));
    this.listenerUnsubscribersMap.delete(sessionId);
    
    this.updateReducer();
  },

  updateReducer() {
    const reducer = this.sessions.reduce(
      (acc, session) => ({ ...acc, [session.id]: session.reducer }),
      staticReducer,
    );
    store.replaceReducer(combineReducers(reducer));
  },

  startListeners() {
    appStartListening({
      actionCreator: addSession,
      effect: (action) => this.createSession(
        action.payload.session.id,
        action.payload.session.debugType,
      ),
    });
    appStartListening({
      actionCreator: removeSession,
      effect: (action) => this.deleteSession(
        action.payload.sessionId,
      ),
    });
  },
};

export default sessionManager;