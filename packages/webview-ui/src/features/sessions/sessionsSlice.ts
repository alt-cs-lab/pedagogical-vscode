import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

/** `DP.Thread` with an added `stackFrameIds` array */
export type SessionStateThread = DP.Thread & { stackFrameIds: number[] };

/** `DP.StackFrame` with an added `scopeVariableReferences` array */
export type SessionStateStackFrame = DP.StackFrame & { scopeVariableReferences: number[] };

type SessionsState = Record<string, Session>;

export type Session = {
  name: string;
  type: string;
  id: string;
  threads: Record<number, SessionStateThread>;
  stackFrames: Record<number, SessionStateStackFrame>;
  scopes: Record<number, DP.Scope>;
  variableRefs: Record<number, DP.Variable[]>;
};

const initialState: SessionsState = {};

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    buildSession: (_state, _action: PayloadAction<{ id: string }>) => undefined,

    buildSessionDone: (_state, _action: PayloadAction<{id: string }>) => undefined,

    addSession: (state, action: PayloadAction<Pick<Session, "name" | "type" | "id">>) => {
      state[action.payload.id] = {
        ...action.payload,
        threads: {},
        stackFrames: {},
        scopes: {},
        variableRefs: {},
      };
    },

    clearSession: (state, action: PayloadAction<{ id: string }>) => {
      state[action.payload.id] = {
        ...state[action.payload.id],
        threads: {},
        stackFrames: {},
        scopes: {},
        variableRefs: {},
      };
    },

    removeSession: (state, action: PayloadAction<{ id: string }>) => {
      delete state[action.payload.id];
    },

    addThreads: (state, action: PayloadAction<{ id: string; threads: SessionStateThread[] }>) => {
      for (const thread of action.payload.threads) {
        state[action.payload.id].threads[thread.id] = thread;
      }
    },

    addStackTrace: (
      state,
      action: PayloadAction<{ id: string; frames: SessionStateStackFrame[] }>
    ) => {
      for (const frame of action.payload.frames) {
        state[action.payload.id].stackFrames[frame.id] = frame;
      }
    },

    addScopes: (state, action: PayloadAction<{ id: string; scopes: DP.Scope[] }>) => {
      for (const scope of action.payload.scopes) {
        state[action.payload.id].scopes[scope.variablesReference] = scope;
      }
    },

    addVariables: (state, action: PayloadAction<{ id: string; ref: number, variables: DP.Variable[] }>) => {
      state[action.payload.id].variableRefs[action.payload.ref] = action.payload.variables;
    },
  },
});

export const {
  addScopes,
  addStackTrace,
  addThreads,
  addVariables,
  buildSession,
  buildSessionDone,
  clearSession,
  addSession,
  removeSession,
} = sessionsSlice.actions;
