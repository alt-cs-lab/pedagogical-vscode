import { EntityState, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SessionEntity, sessionsAdapter } from "./entities";

export type SessionManagerState = {
  currentSessionId: string | null,
  sessions: EntityState<SessionEntity>,
};

const initialState: SessionManagerState = {
  currentSessionId: null,
  sessions: sessionsAdapter.getInitialState(),
};

const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    addSession: (state, action: PayloadAction<{ session: SessionEntity }>) => {
      sessionsAdapter.addOne(state.sessions, action.payload.session);
    },
    removeSession: (state, action: PayloadAction<{ sessionId: string }>) => {
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
});

export const {
  addSession,
  removeSession,
  setAllSessions,
  setCurrentSessionId,
} = sessionsSlice.actions;
export default sessionsSlice;
