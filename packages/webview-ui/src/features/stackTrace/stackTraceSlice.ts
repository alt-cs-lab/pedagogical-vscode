import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";
import { debugAdapterApi } from "../../services/debugAdapterApi";

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
  extraReducers: (builder) => {
    builder.addMatcher(debugAdapterApi.endpoints.getStackTrace.matchFulfilled, (state, action) => {
      state.stackFrames = action.payload.stackFrames;
      state.totalFrames = action.payload.totalFrames;
    })
  }
});

export const { setStackTrace } = stateTraceSlice.actions;

export const stackTraceReducer = stateTraceSlice.reducer;
