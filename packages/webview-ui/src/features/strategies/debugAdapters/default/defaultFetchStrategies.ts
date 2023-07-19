import { DebugProtocol as DP } from "@vscode/debugprotocol";
import {
  fetchScopesThunk,
  fetchStackTraceThunk,
  fetchThreadsThunk,
  fetchVariablesThunk,
} from "../../../sessions/thunks";
import {
  ScopeEntity,
  StackFrameEntity,
  VariablesEntity,
  toScopeEntities,
  toStackFrameEntities,
  toThreadEntities,
  toVariablesEntity,
} from "../../../sessions/entities";
import {
  FetchScopesStrategy,
  FetchStackTracesStrategy,
  FetchThreadsStrategy,
  FetchVariablesStrategy
} from "../../strategyTypes";

/**
 * Default: fetch all threads
 */
export const defaultFetchThreadsStrategy: FetchThreadsStrategy = async (api, sessionId) => {
  const threadsResult = await api
    .dispatch(fetchThreadsThunk({ sessionId }))
    .unwrap();
  return toThreadEntities(threadsResult.threads);
};

/**
 * Default: fetch all stack frames that are not "subtle" or "label"
 */
export const defaultFetchStackTraceStrategy: FetchStackTracesStrategy = async (api, sessionId, threads) => {
  const stackFrames: StackFrameEntity[] = [];
  for (const thread of threads) {
    const stackTraceResult = await api
      .dispatch(
        fetchStackTraceThunk({
          sessionId,
          threadId: thread.id,
        })
      )
      .unwrap();

    const frames = stackTraceResult.stackFrames.filter(
      (frame) =>
        frame.presentationHint !== "subtle" &&
        frame.presentationHint !== "label"
    );
    stackFrames.push(...toStackFrameEntities(thread.id, frames));
    thread.stackFrameIds = frames.map((frame) => frame.id);
  }
  return stackFrames;
};

/**
 * Default: Only fetch scopes that begin with "Local"
 */
export const defaultFetchScopesStrategy: FetchScopesStrategy = async (api, sessionId, stackFrames) => {
  const scopes: ScopeEntity[] = [];
  for (const frame of stackFrames) {
    const scopesResult = await api
      .dispatch(
        fetchScopesThunk({
          sessionId,
          frameId: frame.id,
        })
      )
      .unwrap();

    // by default, ignore scopes that don't begin with "Local"
    const filteredScopes = scopesResult.scopes.filter((scope) =>
      scope.name.startsWith("Local")
    );
    const scopeEntities = toScopeEntities(frame.id, filteredScopes);

    scopes.push(...scopeEntities);
    frame.scopeIds = scopeEntities.map((scope) => scope.pedagogId);
  }
  return scopes;
};

/**
 * Default: fetch all variables
 */
export const defaultFetchVariablesStrategy: FetchVariablesStrategy = async (api, sessionId, scopes) => {
  // queue of variable references to fetch
  // start with reference from each scope
  const refsToFetch: number[] = scopes.map((scope) => scope.variablesReference);

  // keep track of refs so we don't fetch anything twice
  const refsFetched = new Set<number>();

  const variables: VariablesEntity[] = [];
  let ref = refsToFetch.shift();
  while (ref) {
    if (!refsFetched.has(ref)) {
      const variablesArgs: DP.VariablesArguments = { variablesReference: ref };
      const variablesResp = await api
        .dispatch(
          fetchVariablesThunk({
            sessionId,
            ...variablesArgs,
          })
        )
        .unwrap();

      // this sets pedagogId to variablesReference, which you probably want to change
      // because variablesReference changes every time the debugger pauses.
      const variablesEntity = toVariablesEntity(
        variablesArgs,
        variablesResp.variables
      );

      variables.push(variablesEntity);

      // fetch child variables as long as reference > 0
      const childRefs = variablesEntity.variables
        .map((v) => v.variablesReference)
        .filter((ref) => ref > 0);
      refsToFetch.push(...childRefs);
      refsFetched.add(ref);
    }
    ref = refsToFetch.shift();
  }

  return variables;
};
