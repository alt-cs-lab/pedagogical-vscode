import { EntityState, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity, scopesAdapter, stackFramesAdapter, threadsAdapter, variablesAdapter } from "./entities";

/** PayloadAction that has `sessionId` and `debugType` in its meta property */
export type DebugSessionAction<P = void> = PayloadAction<P, string, { sessionId: string, debugType: string }>;

export type SessionsState = Record<string, Session>;

export type Session = {
  name: string;
  debugType: string;
  id: string;
  threads: EntityState<ThreadEntity>;
  stackFrames: EntityState<StackFrameEntity>;
  scopes: EntityState<ScopeEntity>;
  variables: EntityState<VariablesEntity>;
};

const initialState: SessionsState = {};

type SetSessionPayload = {
  threads: ThreadEntity[],
  stackFrames: StackFrameEntity[],
  scopes: ScopeEntity[],
  variables: VariablesEntity[],
};

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState: initialState,
  reducers: {
    debuggerPaused: {
      reducer: (_state, _action: DebugSessionAction<void>) => undefined,
      prepare(sessionId: string, debugType: string) {
        return { payload: undefined, meta: { sessionId, debugType } };
      }
    },

    addSession: {
      reducer(state, action: DebugSessionAction<{ id: string, name: string, type: string }>) {
        state[action.payload.id] = {
          id: action.payload.id,
          name: action.payload.name,
          debugType: action.payload.type,
          threads: threadsAdapter.getInitialState(),
          stackFrames: stackFramesAdapter.getInitialState(),
          scopes: scopesAdapter.getInitialState(),
          variables: variablesAdapter.getInitialState(),
        };
      },
      prepare(payload: { id: string, name: string, type: string }) {
        return { payload, meta: { sessionId: payload.id, debugType: payload.type } };
      }
    },

    setAllSession: {
      reducer(state, action: DebugSessionAction<SetSessionPayload>) {
        const session = state[action.meta.sessionId];
        threadsAdapter.setAll(session.threads, action.payload.threads);
        stackFramesAdapter.setAll(session.stackFrames, action.payload.stackFrames);
        scopesAdapter.setAll(session.scopes, action.payload.scopes);
        variablesAdapter.setAll(session.variables, action.payload.variables);
      },
      prepare(sessionId: string, debugType: string, payload: SetSessionPayload) {
        return { payload, meta: { sessionId, debugType }};
      }
    },

    removeSession: {
      reducer(state, action: DebugSessionAction<void>) {
        delete state[action.meta.sessionId];
      },
      prepare(sessionId: string, debugType: string) {
        return { payload: undefined, meta: { sessionId, debugType } };
      }
    },
  },
  // extraReducers: sessionsSliceExtraReducers,
});

export const {
  addSession,
  setAllSession,
  removeSession,
  debuggerPaused,
} = sessionsSlice.actions;
