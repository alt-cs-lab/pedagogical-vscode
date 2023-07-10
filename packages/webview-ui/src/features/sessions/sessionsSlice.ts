import { EntityState, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity, scopesAdapter, stackFramesAdapter, threadsAdapter, variablesAdapter } from "./debugAdapters/entities";
import { fetchThreads, fetchStackTrace, fetchScopes, fetchVariables, fetchSessionState } from "./debugAdapters/thunks";

export type PayloadActionWithDebugType<P = void> = PayloadAction<P, string, { debugType: string }>;

type SessionsState = Record<string, Session>;

export type Session = {
  name: string;
  type: string;
  id: string;
  threads: EntityState<ThreadEntity>;
  stackFrames: EntityState<StackFrameEntity>;
  scopes: EntityState<ScopeEntity>;
  variables: EntityState<VariablesEntity>;
};

const initialState: SessionsState = {};

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    debuggerPaused: (state, action: PayloadAction<{ sessionId: string }>) => {
      state[action.payload.sessionId] = {
        ...state[action.payload.sessionId],
        // threads: threadsAdapter.getInitialState(),
        // stackFrames: stackFramesAdapter.getInitialState(),
        // scopes: scopesAdapter.getInitialState(),
        // variables: variablesAdapter.getInitialState(),
      };
    },

    addSession: {
      reducer(state, action: PayloadActionWithDebugType<{ sessionId: string, name: string, type: string }>) {
        state[action.payload.sessionId] = {
          id: action.payload.sessionId,
          name: action.payload.name,
          type: action.payload.type,
          threads: threadsAdapter.getInitialState(),
          stackFrames: stackFramesAdapter.getInitialState(),
          scopes: scopesAdapter.getInitialState(),
          variables: variablesAdapter.getInitialState(),
        };
      },
      prepare(payload: { sessionId: string, name: string, type: string }) {
        return { payload, meta: { debugType: payload.type } };
      }
    },

    removeSession: (state, action: PayloadAction<{ sessionId: string }>) => {
      delete state[action.payload.sessionId];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSessionState.fulfilled, (state, action) => {
      const session = state[action.meta.arg.sessionId];
      threadsAdapter.setAll(session.threads, action.payload.threads);
      stackFramesAdapter.setAll(session.stackFrames, action.payload.stackFrames);
      scopesAdapter.setAll(session.scopes, action.payload.scopes);
      variablesAdapter.setAll(session.variables, action.payload.variables);
    });

    builder.addCase(fetchThreads.fulfilled, (state, action) => {
      const session = state[action.meta.arg.sessionId];
      threadsAdapter.upsertMany(session.threads, action.payload.threads);
    });

    builder.addCase(fetchStackTrace.fulfilled, (state, action) => {
      const session = state[action.meta.arg.sessionId];
      stackFramesAdapter.upsertMany(session.stackFrames, action.payload.stackFrames);

      const newFrameIds = action.payload.stackFrames.map((frame) => frame.id);
      session.threads.entities[action.meta.arg.threadId]?.stackFrameIds.push(...newFrameIds);
    });

    builder.addCase(fetchScopes.fulfilled, (state, action) => {
      const session = state[action.meta.arg.sessionId];
      scopesAdapter.upsertMany(session.scopes, action.payload.scopes);

      const frameId = action.meta.arg.frameId;
      const newScopeIds = action.payload.scopes.map((scope) => scope.pedagogId);
      session.stackFrames.entities[frameId]?.scopeIds.push(...newScopeIds);
    });

    builder.addCase(fetchVariables.fulfilled, (state, action) => {
      const session = state[action.meta.arg.sessionId];
      variablesAdapter.upsertOne(session.variables, action.payload);
    });
  },
});

export const {
  addSession,
  removeSession,
  debuggerPaused,
} = sessionsSlice.actions;
