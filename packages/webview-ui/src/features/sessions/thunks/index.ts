import { createAsyncThunk } from "@reduxjs/toolkit";
import { Session, updateSession } from "../sessionsSlice";
import { defaultFetchSession } from "./default";
import { buildFlow } from "../../flow/flowSlice";

export const fetchSession = createAsyncThunk<void, Session>(
  "session/fetchSession",
  async (session, thunkApi) => {
    let newSession: Session;
    switch (session.type) {
      default:
        newSession = await defaultFetchSession(session);
    }
    thunkApi.dispatch(updateSession(newSession));
    thunkApi.dispatch(buildFlow({ session: newSession }));
  }
);