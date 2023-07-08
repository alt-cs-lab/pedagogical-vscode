import {  createReducer } from "@reduxjs/toolkit";
import { threadsAdapter, stackFramesAdapter, scopesAdapter, variablesAdapter } from "./entities";
import { fetchScopes, fetchStackTrace, fetchThreads, fetchVariables } from "./thunks";

const initialState = {
  threads: threadsAdapter.getInitialState(),
  stackFrames: stackFramesAdapter.getInitialState(),
  scopes: scopesAdapter.getInitialState(),
  variables: variablesAdapter.getInitialState(),
};

export const defaultDebugReducer = createReducer(
  initialState,
  (builder) => {
    builder.addCase(fetchThreads.fulfilled, (state, action) => {
      threadsAdapter.upsertMany(state.threads, action.payload.threads);
    });

    builder.addCase(fetchStackTrace.fulfilled, (state, action) => {
      stackFramesAdapter.upsertMany(state.stackFrames, action.payload.stackFrames);

      const newFrameIds = action.payload.stackFrames.map((frame) => frame.id);
      state.threads.entities[action.meta.arg.threadId]?.stackFrameIds.push(...newFrameIds);
    });

    builder.addCase(fetchScopes.fulfilled, (state, action) => {
      scopesAdapter.upsertMany(state.scopes, action.payload.scopes);

      const frameId = action.meta.arg.frameId;
      const newScopeIds = action.payload.scopes.map((scope) => scope.pedagogId);
      state.stackFrames.entities[frameId]?.scopeIds.push(...newScopeIds);
    });

    builder.addCase(fetchVariables.fulfilled, (state, action) => {
      variablesAdapter.upsertOne(state.variables, action.payload);
    });
  }
);