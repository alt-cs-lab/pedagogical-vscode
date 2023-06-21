import { createSlice } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { debugAdapterApi } from "../../services/debugAdapterApi";

export type DebugSessionState = {
  threads: Record<number, DP.Thread>;
  stackFrames: Record<number, DP.StackFrame>;
  scopes: Record<number, DP.Scope>;
  /** array of variables associated with reference number */
  variables: Record<number, DP.Variable[] | null>;
};

const initialState: DebugSessionState = {
  threads: {},
  stackFrames: {},
  scopes: {},
  variables: {},
};

const debugSessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSession: (state) => {
      state.threads = {};
      state.stackFrames = {};
      state.scopes = {};
      state.variables = {};
    },
  },
  // extraReducers: (builder) => {
  //   builder.addMatcher(debugAdapterApi.endpoints.getThreads.matchFulfilled, (state, action) => {
  //     for (const thread of action.payload.threads) {
  //       state.threads[thread.id] = thread;
  //     }
  //   });
  //   builder.addMatcher(debugAdapterApi.endpoints.getStackTrace.matchFulfilled, (state, action) => {
  //     // TODO: handle paginated frames
  //     for (const frame of action.payload.stackFrames) {
  //       state.stackFrames[frame.id] = frame;
  //     }
  //   });
  //   builder.addMatcher(debugAdapterApi.endpoints.getScopes.matchFulfilled, (state, action) => {
  //     for (const scope of action.payload.scopes) {
  //       if (scope.name === "special variables") {
  //         continue;
  //       }
  //       const varRef = scope.variablesReference;
  //       state.scopes[varRef] = scope;
  //       if (state.variables[varRef] === undefined) {
  //         state.variables[varRef] = null;
  //       }
  //     }
  //   });
  //   builder.addMatcher(debugAdapterApi.endpoints.getVariables.matchFulfilled, (state, action) => {
  //     const ref = action.meta.arg.originalArgs.variablesReference;
  //     state.variables[ref] = action.payload.variables;
  //     for (const nextVar of action.payload.variables) {
  //       if (nextVar.name === "special variables" || nextVar.name === "function variables") {
  //         continue;
  //       }
  //       const nextRef = nextVar.variablesReference;
  //       if (nextRef > 0 && state.variables[nextRef] === undefined) {
  //         state.variables[nextRef] = null;
  //       }
  //     }
  //   });
  // },
});

export const { clearSession } = debugSessionSlice.actions;

export const debugSessionReducer = debugSessionSlice.reducer;
