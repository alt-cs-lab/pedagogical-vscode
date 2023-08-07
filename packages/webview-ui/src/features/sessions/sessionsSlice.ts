import { EntityState, PayloadAction, UnsubscribeListener, createSlice } from "@reduxjs/toolkit";
import { SessionEntity, sessionsAdapter } from "./entities";
import BaseSession, { BaseSessionState } from "./debugSessions/BaseSession";
import { isSessionAction } from "./sessionAction";
import { getSessionClassByDebugType } from "./sessionManager";
import { appAddListener, appStartListening } from "../../listenerMiddleware";

const sessionInstances = new Map<string, BaseSession>();

const sessionListenerUnsubscribers = new Map<string, UnsubscribeListener[]>();

export type SessionManagerState = {
  currentSessionId: string | null,
  sessions: EntityState<SessionEntity>,
  sessionStates: Record<string, BaseSessionState>,
};

const initialState: SessionManagerState = {
  currentSessionId: null,
  sessions: sessionsAdapter.getInitialState(),
  sessionStates: {},
};

const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    addSession: (state, action: PayloadAction<{ sessionEntity: SessionEntity, preloadedState?: BaseSessionState }>) => {
      const SessionClass = getSessionClassByDebugType(action.payload.sessionEntity.type);
      const session = new SessionClass(action.payload.sessionEntity.id, action.payload.preloadedState);
      sessionInstances.set(session.id, session);

      sessionsAdapter.addOne(state.sessions, action.payload.sessionEntity);
      state.sessionStates[session.id] = session.initialState;
    },
    removeSession: (state, action: PayloadAction<{ sessionId: string }>) => {
      sessionInstances.delete(action.payload.sessionId);
      sessionsAdapter.removeOne(state.sessions, action.payload.sessionId);
      if (action.payload.sessionId === state.currentSessionId) {
        state.currentSessionId = state.sessions.ids.length > 0 ? state.sessions.ids[0].toString() : null;
      }
    },
    setAllSessions: (state, action: PayloadAction<{ sessions: SessionEntity[], currentSessionId: string | null }>) => {
      sessionsAdapter.setAll(state.sessions, action.payload.sessions);
      state.currentSessionId = action.payload.currentSessionId;
    },
    setCurrentSessionId: (state, action: PayloadAction<{ sessionId: string | null }>) => {
      if (action.payload.sessionId === null || state.sessions.ids.includes(action.payload.sessionId)) {
        state.currentSessionId = action.payload.sessionId;
      } else {
        console.error(`tried to change to session ${action.payload.sessionId}, but it doesn't exist!`);
      }
    },
  },
  extraReducers: (builder) => {
    // if an action's sessionId matches a session, run that session's reducer
    builder.addMatcher(isSessionAction, (state, action) => {
      const sessionInstance = sessionInstances.get(action.meta.sessionId);
      if (sessionInstance && state.sessionStates[action.meta.sessionId]) {
        state.sessionStates[action.meta.sessionId] = sessionInstance.reducer(
          state.sessionStates[action.meta.sessionId],
          action,
        );
      }
    });
  },
});

// add session listeners after adding a session
appStartListening({
  actionCreator: sessionsSlice.actions.addSession,
  effect: (action, api) => {
    const session = sessionInstances.get(action.payload.sessionEntity.id);
    if (session) {
      const addListenerActions = session.addListeners(appAddListener);
      sessionListenerUnsubscribers.set(
        session.id,
        addListenerActions.map((act) => api.dispatch(act))
      );
    }
  }
});

// unsubscribe session listeners after removing a session
appStartListening({
  actionCreator: sessionsSlice.actions.removeSession,
  effect: (action) => {
    const unsubscribers = sessionListenerUnsubscribers.get(action.payload.sessionId);
    if (unsubscribers) {
      unsubscribers.forEach((unsub) => unsub({ cancelActive: true }));
      sessionListenerUnsubscribers.delete(action.payload.sessionId);
    }
  }
});

export function getSessionComponent(sessionId: string | null) {
  if (sessionId === null) {
    return null;
  }
  const session = sessionInstances.get(sessionId);
  return session ? session.component : null;
}

export const {
  addSession,
  removeSession,
  setAllSessions,
  setCurrentSessionId,
} = sessionsSlice.actions;
export default sessionsSlice;
