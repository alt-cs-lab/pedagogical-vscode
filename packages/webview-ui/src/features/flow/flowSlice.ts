import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { addSession, removeSession } from "../sessions/sessionsSlice";

export type FlowState = {
  currentSessionId: string;
};

const initialState: FlowState = {
  currentSessionId: "",
};

export const flowSlice = createSlice({
  name: "flow",
  initialState: initialState,
  reducers: {
    setCurrentSessionId: (state, action: PayloadAction<{ sessionId: string }>) => {
      state.currentSessionId = action.payload.sessionId;
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(addSession, (state, action) => {
    //   state.currentSessionId = action.payload.id;
    // });

    // builder.addCase(removeSession, (state, action) => {
    //   if (state.currentSessionId === action.meta.sessionId) {
    //     state.currentSessionId = "";
    //   }
    // });
  }
});

export const { setCurrentSessionId } = flowSlice.actions;
