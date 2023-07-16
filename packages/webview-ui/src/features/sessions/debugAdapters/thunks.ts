import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { debugApi } from "./debugApi";
import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity, toScopeEntities, toStackFrameEntities, toThreadEntities, toVariablesEntity } from "../entities";
import { AppDispatch, RootState } from "../../../store";

export type WithSessionId<T> = T & {
  sessionId: string,
};

export type FetchThunkConfig = {
  state: RootState,
  dispatch: AppDispatch,
  pendingMeta: { sessionId: string, debugType: string },
  fulfilledMeta: { sessionId: string, debugType: string },
  rejectedMeta: { sessionId: string, debugType: string },
};

export type FetchThreadsArgs = WithSessionId<unknown>;
export type FetchThreadsReturn = { threads: ThreadEntity[] };

export const fetchThreads = createAsyncThunk<FetchThreadsReturn, FetchThreadsArgs, FetchThunkConfig>(
  "debugAdapter/threads",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getThreads(args.sessionId);
    return api.fulfillWithValue(
      { threads: toThreadEntities(resp.threads) },
      { sessionId: session.id, debugType: session.debugType },
    );
  },
  {
    getPendingMeta(base, api) {
      return {
        sessionId: base.arg.sessionId,
        debugType: api.getState().sessions[base.arg.sessionId].debugType,
      };
    }
  }
);

export type FetchStackTraceArgs = WithSessionId<DP.StackTraceArguments>;
export type FetchStackTraceReturn = { stackFrames: StackFrameEntity[] };
export const fetchStackTrace = createAsyncThunk<FetchStackTraceReturn, FetchStackTraceArgs, FetchThunkConfig>(
  "debugAdapter/stackTrace",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getStackTrace(args.sessionId, args);
    return api.fulfillWithValue(
      { stackFrames: toStackFrameEntities(args.threadId, resp.stackFrames) },
      { sessionId: session.id, debugType: session.debugType },
    );
  },
  {
    getPendingMeta(base, api) {
      return {
        sessionId: base.arg.sessionId,
        debugType: api.getState().sessions[base.arg.sessionId].debugType,
      };
    }
  }
);


export type FetchScopesArgs = WithSessionId<DP.ScopesArguments>;
export type FetchScopesReturn = { scopes: ScopeEntity[] };
export const fetchScopes = createAsyncThunk<FetchScopesReturn, FetchScopesArgs, FetchThunkConfig>(
  "debugAdapter/scopes",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getScopes(args.sessionId, args);
    return api.fulfillWithValue(
      { scopes: toScopeEntities(args.frameId, resp.scopes) },
      { sessionId: session.id, debugType: session.debugType },
    );
  },
  {
    getPendingMeta(base, api) {
      return {
        sessionId: base.arg.sessionId,
        debugType: api.getState().sessions[base.arg.sessionId].debugType,
      };
    }
  }
);


export type FetchVariablesArgs = WithSessionId<DP.VariablesArguments>;
export type FetchVariablesReturn = VariablesEntity;
export const fetchVariables = createAsyncThunk<FetchVariablesReturn, FetchVariablesArgs, FetchThunkConfig>(
  "debugAdapter/variables",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getVariables(args.sessionId, args);
    return api.fulfillWithValue(
      toVariablesEntity(args, resp.variables),
      { sessionId: session.id, debugType: session.debugType },
    );
  },
  {
    getPendingMeta(base, api) {
      return {
        sessionId: base.arg.sessionId,
        debugType: api.getState().sessions[base.arg.sessionId].debugType,
      };
    }
  }
);

export const isFetchFulfilledAction = isAnyOf(
  fetchThreads.fulfilled,
  fetchStackTrace.fulfilled,
  fetchScopes.fulfilled,
  fetchVariables.fulfilled
);
