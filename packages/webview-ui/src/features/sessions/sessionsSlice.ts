import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

/** `DP.Thread` with an added `stackFrameIds` array */
export type SessionThread = DP.Thread & { stackFrameIds: number[] };

/** `DP.StackFrame` with an added `scopeVariableReferences` array */
export type SessionStackFrame = DP.StackFrame & { scopeVariableReferences: number[] };

/** Same as `DP.Scope` */
export type SessionScope = DP.Scope;

/**
 * Record where each key (property) is a variable reference number
 * and each value is an array of variables
 */
export type SessionVariableRefs = Record<number, DP.Variable[]>;

type SessionsState = Record<string, Session>;

export type Session = {
  name: string;
  type: string;
  id: string;
  threads: SessionThread[];
  stackFrames: SessionStackFrame[];
  scopes: DP.Scope[];
  variableRefs: Record<number, DP.Variable[]>;
};

const initialState: SessionsState = {};

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    addSession: (state, action: PayloadAction<Pick<Session, "name" | "type" | "id">>) => {
      state[action.payload.id] = {
        ...action.payload,
        threads: [],
        stackFrames: [],
        scopes: [],
        variableRefs: {},
      };
    },

    updateSession: (state, action: PayloadAction<Partial<Session>>) => {
      if (action.payload.id === undefined) { return; }
      state[action.payload.id] = {
        ...state[action.payload.id],
        ...action.payload,
      };
    },

    clearSession: (state, action: PayloadAction<{ id: string }>) => {
      state[action.payload.id] = {
        ...state[action.payload.id],
        threads: [],
        stackFrames: [],
        scopes: [],
        variableRefs: {},
      };
    },

    removeSession: (state, action: PayloadAction<{ id: string }>) => {
      delete state[action.payload.id];
    },

    addThreads: (state, action: PayloadAction<{ id: string; threads: SessionThread[] }>) => {
      const session = state[action.payload.id];
      session.threads = [...session.threads, ...action.payload.threads];
    },

    addStackTrace: (state, action: PayloadAction<{ id: string; frames: SessionStackFrame[] }>) => {
      const session = state[action.payload.id];
      session.stackFrames = [...session.stackFrames, ...action.payload.frames];
    },

    addScopes: (state, action: PayloadAction<{ id: string; scopes: DP.Scope[] }>) => {
      const session = state[action.payload.id];
      session.scopes = [...session.scopes, ...action.payload.scopes];
    },

    addVariables: (state, action: PayloadAction<{ id: string; ref: number, variables: DP.Variable[] }>) => {
      const session = state[action.payload.id];
      session.variableRefs[action.payload.ref] = action.payload.variables;
    },
  }
});

export const {
  addScopes,
  addStackTrace,
  addThreads,
  addVariables,
  clearSession,
  addSession,
  updateSession,
  removeSession,
} = sessionsSlice.actions;
