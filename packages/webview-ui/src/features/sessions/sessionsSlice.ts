import { EntityState, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SessionEntity, sessionsAdapter } from "./entities";

type SessionManagerState = {
  currentSessionId: string | null,
  sessions: EntityState<SessionEntity>,
};

const initialState: SessionManagerState = {
  currentSessionId: null,
  sessions: sessionsAdapter.getInitialState(),
};

const sessionManagerSlice = createSlice({
  name: "sessionManager",
  initialState: initialState,
  reducers: {
    addSession: (state, action: PayloadAction<{ session: SessionEntity }>) => {
      sessionsAdapter.addOne(state.sessions, action.payload.session);
    },
    removeSession: (state, action: PayloadAction<{ sessionId: string }>) => {
      sessionsAdapter.removeOne(state.sessions, action.payload.sessionId);
      if (action.payload.sessionId === state.currentSessionId) {
        state.currentSessionId = null;
      }
    },
    setCurrentSession: (state, action: PayloadAction<{ sessionId: string }>) => {
      if (state.sessions.ids.includes(action.payload.sessionId)) {
        state.currentSessionId = action.payload.sessionId;
      } else {
        console.error(`tried to change to session ${action.payload.sessionId}, but it doesn't exist!`);
      }
    },
  },
});

export const { addSession, removeSession, setCurrentSession } = sessionManagerSlice.actions;
export default sessionManagerSlice;