import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";

export type StackTraceState = {
  stackFrames: DebugProtocol.StackFrame[];
  totalFrames?: number;
};

const initialState: StackTraceState = {
  stackFrames: [],
  totalFrames: undefined,
};

const stateTraceSlice = createSlice({
  name: "stackTrace",
  initialState,
  reducers: {
    setStackTrace: (state, action: PayloadAction<StackTraceState>) => {
      state = action.payload;
    },
  },
});

export const { setStackTrace } = stateTraceSlice.actions;

export const stackTraceReducer = stateTraceSlice.reducer;
