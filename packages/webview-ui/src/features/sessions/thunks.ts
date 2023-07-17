import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { debugApi } from "./debugApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";

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
export type FetchThreadsReturn = DP.ThreadsResponse["body"];

export const fetchThreadsThunk = createAsyncThunk<FetchThreadsReturn, FetchThreadsArgs, FetchThunkConfig>(
  "debugAdapter/threads",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getThreads(args.sessionId);
    return api.fulfillWithValue(
      resp,
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
export type FetchStackTraceReturn = DP.StackTraceResponse["body"];
export const fetchStackTraceThunk = createAsyncThunk<FetchStackTraceReturn, FetchStackTraceArgs, FetchThunkConfig>(
  "debugAdapter/stackTrace",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getStackTrace(args.sessionId, args);
    return api.fulfillWithValue(
      resp,
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
export type FetchScopesReturn = DP.ScopesResponse["body"];
export const fetchScopesThunk = createAsyncThunk<FetchScopesReturn, FetchScopesArgs, FetchThunkConfig>(
  "debugAdapter/scopes",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getScopes(args.sessionId, args);
    return api.fulfillWithValue(
      resp,
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
export type FetchVariablesReturn = DP.VariablesResponse["body"];
export const fetchVariablesThunk = createAsyncThunk<FetchVariablesReturn, FetchVariablesArgs, FetchThunkConfig>(
  "debugAdapter/variables",
  async (args, api) => {
    const session = api.getState().sessions[args.sessionId];
    const resp = await debugApi.getVariables(args.sessionId, args);

    return api.fulfillWithValue(
      resp,
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
