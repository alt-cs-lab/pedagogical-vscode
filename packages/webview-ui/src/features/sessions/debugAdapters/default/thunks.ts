import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { debugApi } from "../debugApi";
import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesReferenceEntity } from "./entities";

type WithSessionId<T> = T & {
  sessionId: string,
};

type FetchThreadsArgs = WithSessionId<unknown>;
type FetchThreadsReturn = { threads: ThreadEntity[] };
export const fetchThreads = createAsyncThunk<FetchThreadsReturn, FetchThreadsArgs>(
  "debugAdapter/threads",
  async (args) => {
    const resp = await debugApi.getThreads(args.sessionId);
    const threads: ThreadEntity[] = resp.threads.map((thread) => ({
      ...thread,
      stackFrameIds: [],
    }));
    return { threads };
  }
);

type FetchStackTraceArgs = WithSessionId<DP.StackTraceArguments>;
type FetchStackTraceReturn = { stackFrames: StackFrameEntity[] };
export const fetchStackTrace = createAsyncThunk<FetchStackTraceReturn, FetchStackTraceArgs>(
  "debugAdapter/stackTrace",
  async (args) => {
    const resp = await debugApi.getStackTrace(args.sessionId, args);
    const stackFrames: StackFrameEntity[] = resp.stackFrames.map((frame) => ({
      ...frame,
      threadId: args.threadId,
      scopeIds: [],
    }));
    return { stackFrames };
  },
);


type FetchScopesArgs = WithSessionId<DP.ScopesArguments>;
type FetchScopesReturn = { scopes: ScopeEntity[] };
export const fetchScopes = createAsyncThunk<FetchScopesReturn, FetchScopesArgs>(
  "debugAdapter/scopes",
  async (args) => {
    const resp = await debugApi.getScopes(args.sessionId, args);
    const scopes: ScopeEntity[] = resp.scopes.map((scope) => ({
      pedagogId: `${args.frameId}-${scope.name}`,
      stackFrameId: args.frameId,
      ...scope,
    }));
    return { scopes };
  }
);


type FetchVariablesArgs = WithSessionId<DP.VariablesArguments>;
type FetchVariablesReturn = VariablesReferenceEntity;
export const fetchVariables = createAsyncThunk<FetchVariablesReturn, FetchVariablesArgs>(
  "debugAdapter/variables",
  async (args) => {
    const resp = await debugApi.getVariables(args.sessionId, args);
    return {
      pedagogId: args.variablesReference,
      ...args,
      ...resp,
    };
  }
);

export const isFetchFulfilledAction = isAnyOf(
  fetchThreads.fulfilled,
  fetchStackTrace.fulfilled,
  fetchScopes.fulfilled,
  fetchVariables.fulfilled
);
