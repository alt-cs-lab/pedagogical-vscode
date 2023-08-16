import { EntityState, PayloadAction, UnsubscribeListener, createSlice } from "@reduxjs/toolkit";
import { SessionEntity, sessionsAdapter } from "./entities";
import BaseSession, { BaseSessionState } from "./debugSessions/BaseSession";
import { isSessionAction } from "./sessionAction";
import { appAddListener, appStartListening } from "../../listenerMiddleware";
import { messageController, vscode } from "../../util";
import { RootState, store } from "../../store";
import { VsCodeMessage } from "shared";
import { getSessionClassByDebugType } from "./debugSessions";

const sessionInstances = new Map<string, BaseSession>();

const sessionListenerUnsubscribers = new Map<string, UnsubscribeListener[]>();

export type SessionManagerState = {
  currentSessionId: string | null,
  sessionEntities: EntityState<SessionEntity>,
  sessionStates: Record<string, BaseSessionState>,
};

const initialState: SessionManagerState = {
  currentSessionId: null,
  sessionEntities: sessionsAdapter.getInitialState(),
  sessionStates: {},
};

const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    addSession: (state, action: PayloadAction<{ sessionEntity: SessionEntity, preloadedState?: Partial<BaseSessionState> }>) => {
      const SessionClass = getSessionClassByDebugType(action.payload.sessionEntity.type);
      const session = new SessionClass(action.payload.sessionEntity.id, action.payload.preloadedState);
      sessionInstances.set(session.id, session);

      sessionsAdapter.addOne(state.sessionEntities, action.payload.sessionEntity);
      state.sessionStates[session.id] = session.initialState;
    },
    removeSession: (state, action: PayloadAction<{ sessionId: string }>) => {
      sessionInstances.delete(action.payload.sessionId);
      sessionsAdapter.removeOne(state.sessionEntities, action.payload.sessionId);
      if (action.payload.sessionId === state.currentSessionId) {
        state.currentSessionId = state.sessionEntities.ids.length > 0 ? state.sessionEntities.ids[0].toString() : null;
      }
      delete state.sessionStates[action.payload.sessionId];
    },
    sessionsInitialized: () => undefined,
    setCurrentSessionId: (state, action: PayloadAction<{ sessionId: string | null }>) => {
      if (action.payload.sessionId === null || state.sessionEntities.ids.includes(action.payload.sessionId)) {
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

export async function setInitialSessionManagerState() {

  // get currently running sessions from vscode
  // this includes name, type, id, and lastPause
  const resp = await messageController.postRequestAndWaitAsync({
    type: "getAllSessionsRequest",
    data: undefined,
  }, 3000) as VsCodeMessage<"getAllSessionsResponse">;
  const activeSessionId = resp.data.activeSessionId;
  const currentSessions = resp.data.sessions;

  // load persisted session states if they exist
  const preloadedSessionStateResults: Record<string, BaseSessionState> = {};
  const persistedState = (vscode.getState() as RootState | undefined)?.sessions;
  if (persistedState) {
    for (const persistedSessionId of Object.keys(persistedState.sessionStates)) {
      const currentSession = currentSessions.find((val) => val.id === persistedSessionId);
      if (currentSession === undefined) {
        // session was in the stored state, but was closed since then
        continue;
      }

      const persistedSession = persistedState.sessionStates[persistedSessionId];
      preloadedSessionStateResults[persistedSessionId] = {
        ...persistedSession,
        lastPause: currentSession.lastPause,
      };
    }
  }

  // now add all current sessions, with preloaded state if it exists
  for (const currentSession of currentSessions) {
    const preloadedSessionState: BaseSessionState | undefined = preloadedSessionStateResults[currentSession.id];
    store.dispatch(addSession({
      sessionEntity: currentSession satisfies SessionEntity,
      preloadedState: preloadedSessionState ? preloadedSessionState : currentSession,
    }));
  }
  store.dispatch(setCurrentSessionId({ sessionId: activeSessionId }));
  store.dispatch(sessionsInitialized());
}

export const {
  addSession,
  removeSession,
  sessionsInitialized,
  setCurrentSessionId,
} = sessionsSlice.actions;
export default sessionsSlice;
