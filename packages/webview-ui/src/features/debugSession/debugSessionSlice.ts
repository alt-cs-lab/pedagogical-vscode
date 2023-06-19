import { createSlice } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { debugAdapterApi } from "../../services/debugAdapterApi";

export type DebugSessionState = {
  threads: Record<number, DP.Thread>;
  stackFrames: Record<number, DP.StackFrame>;
  scopes: Record<number, DP.Scope>;
  /** array of variables associated with reference number */
  variableRefs: Record<number, DP.Variable[]>;
};

const initialState: DebugSessionState = {
  threads: {},
  stackFrames: {},
  scopes: {},
  variableRefs: {},
};

const debugSessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSession: (state) => {
      state.threads = [];
      state.stackFrames = {};
      state.scopes = {};
      state.variableRefs = {};
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(debugAdapterApi.endpoints.getThreads.matchFulfilled, (state, action) => {
      state.threads = action.payload.threads.reduce(
        (acc, thread) => ((acc[thread.id] = thread), acc),
        state.threads
      );
    });
    builder.addMatcher(debugAdapterApi.endpoints.getStackTrace.matchFulfilled, (state, action) => {
      state.stackFrames = action.payload.stackFrames.reduce(
        (acc, frame) => ((acc[frame.id] = frame), acc),
        state.stackFrames
      );
    });
    builder.addMatcher(debugAdapterApi.endpoints.getScopes.matchFulfilled, (state, action) => {
      state.scopes = action.payload.scopes.reduce(
        (acc, scope) => ((acc[scope.variablesReference] = scope), acc),
        state.scopes
      );
    });
    builder.addMatcher(debugAdapterApi.endpoints.getVariables.matchFulfilled, (state, action) => {
      state.variableRefs[action.meta.arg.originalArgs.variablesReference] =
        action.payload.variables;
    });
  },
});

export const { clearSession: clearSession } = debugSessionSlice.actions;

export const debugSessionReducer = debugSessionSlice.reducer;
