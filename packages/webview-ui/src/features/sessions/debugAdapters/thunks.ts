import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { debugApi } from "./debugApi";
import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity, toScopeEntities, toStackFrameEntities, toThreadEntities, toVariablesEntity } from "./entities";
import { RootState } from "../../../store";

type WithSessionId<T> = T & {
  sessionId: string,
};

type FetchThunkConfig = {
  state: RootState,
  pendingMeta: { sessionId: string, debugType: string },
  fulfilledMeta: { sessionId: string, debugType: string },
  rejectedMeta: { sessionId: string, debugType: string },
};

type FetchSessionStateArgs = WithSessionId<unknown>;
type FetchSessionStateReturn = {
  threads: ThreadEntity[],
  stackFrames: StackFrameEntity[],
  scopes: ScopeEntity[],
  variables: VariablesEntity[],
};
export const fetchSessionState = createAsyncThunk<FetchSessionStateReturn, FetchSessionStateArgs, FetchThunkConfig>(
  "debugAdapter/session",
  async (args, thunkApi) => {
    const session = thunkApi.getState().sessions[args.sessionId];

    const threadsResp = await debugApi.getThreads(args.sessionId);
    const threads = toThreadEntities(threadsResp.threads);

    const stackFrames: StackFrameEntity[] = [];
    for (const thread of threads) {
      const stackTraceResp = await debugApi.getStackTrace(args.sessionId, { threadId: thread.id });
      // TODO: filter frames
      const frameEntities = toStackFrameEntities(thread.id, stackTraceResp.stackFrames);
      stackFrames.push(...frameEntities);
      thread.stackFrameIds = frameEntities.map((frame) => frame.id);
    }

    const scopes: ScopeEntity[] = [];
    for (const frame of stackFrames) {
      const scopesResp = await debugApi.getScopes(args.sessionId, { frameId: frame.id });
      const scopesFiltered = scopesResp.scopes.filter((scope) => scope.name.startsWith("Local"));
      const scopeEntities = toScopeEntities(frame.id, scopesFiltered);
      scopes.push(...scopeEntities);
      frame.scopeIds = scopeEntities.map((scope) => scope.pedagogId);
    }

    const variables: VariablesEntity[] = [];
    const refsFetched = new Set<number>();
    const refsToFetch: number[] = scopes.map((scope) => scope.variablesReference);

    let ref = refsToFetch.shift();
    while (ref) {
      if (!refsFetched.has(ref)) {
        const variablesArgs: DP.VariablesArguments = { variablesReference: ref };
        const variablesResp = await debugApi.getVariables(args.sessionId, variablesArgs);

        // TODO: this is only good for the python debugger
        const filteredVariables = variablesResp.variables.filter((variable) =>(
          !variable.name.endsWith(" variables") && !variable.presentationHint?.lazy
        ));

        const variablesEntity = toVariablesEntity(variablesArgs, filteredVariables);
        variables.push(variablesEntity);

        const childRefs = variablesEntity.variables.map((v) => v.variablesReference).filter((ref) => ref > 0);
        refsToFetch.push(...childRefs);
        refsFetched.add(ref);
      }
      ref = refsToFetch.shift();
    }

    return thunkApi.fulfillWithValue({
      threads,
      stackFrames,
      scopes,
      variables,
    }, { sessionId: session.id, debugType: session.debugType });
  },
  {
    getPendingMeta: (base, thunkApi) => {
      const session = thunkApi.getState().sessions[base.arg.sessionId];
      return { sessionId: session.id, debugType: session.debugType };
    }
  }
);

type FetchThreadsArgs = WithSessionId<unknown>;
type FetchThreadsReturn = { threads: ThreadEntity[] };

export const fetchThreads = createAsyncThunk<FetchThreadsReturn, FetchThreadsArgs>(
  "debugAdapter/threads",
  async (args) => {
    const resp = await debugApi.getThreads(args.sessionId);
    return { threads: toThreadEntities(resp.threads) };
  }
);

type FetchStackTraceArgs = WithSessionId<DP.StackTraceArguments>;
type FetchStackTraceReturn = { stackFrames: StackFrameEntity[] };
export const fetchStackTrace = createAsyncThunk<FetchStackTraceReturn, FetchStackTraceArgs>(
  "debugAdapter/stackTrace",
  async (args) => {
    const resp = await debugApi.getStackTrace(args.sessionId, args);
    return { stackFrames: toStackFrameEntities(args.threadId, resp.stackFrames) };
  },
);


type FetchScopesArgs = WithSessionId<DP.ScopesArguments>;
type FetchScopesReturn = { scopes: ScopeEntity[] };
export const fetchScopes = createAsyncThunk<FetchScopesReturn, FetchScopesArgs>(
  "debugAdapter/scopes",
  async (args) => {
    const resp = await debugApi.getScopes(args.sessionId, args);
    return { scopes: toScopeEntities(args.frameId, resp.scopes) };
  }
);


type FetchVariablesArgs = WithSessionId<DP.VariablesArguments>;
type FetchVariablesReturn = VariablesEntity;
export const fetchVariables = createAsyncThunk<FetchVariablesReturn, FetchVariablesArgs>(
  "debugAdapter/variables",
  async (args) => {
    const resp = await debugApi.getVariables(args.sessionId, args);
    return toVariablesEntity(args, resp.variables);
  }
);

export const isFetchFulfilledAction = isAnyOf(
  fetchSessionState.fulfilled,
  fetchThreads.fulfilled,
  fetchStackTrace.fulfilled,
  fetchScopes.fulfilled,
  fetchVariables.fulfilled
);
