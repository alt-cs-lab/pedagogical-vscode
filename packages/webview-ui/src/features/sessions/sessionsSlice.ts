import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SessionEntity, sessionsAdapter } from "./entities";

const sessionsSlice = createSlice({
  name: "sessions",
  initialState: sessionsAdapter.getInitialState(),
  reducers: {
    addSession: (state, action: PayloadAction<{ session: SessionEntity }>) => {
      sessionsAdapter.addOne(state, action.payload.session);
    },
    removeSession: (state, action: PayloadAction<{ sessionId: string }>) => {
      sessionsAdapter.removeOne(state, action.payload.sessionId);
    },
  },
});

export const { addSession, removeSession } = sessionsSlice.actions;
export default sessionsSlice;