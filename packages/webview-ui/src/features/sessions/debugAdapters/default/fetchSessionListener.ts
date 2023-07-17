import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { isAllOf } from "@reduxjs/toolkit";
import { isUnknownDebugType } from "../matchers";
import { debuggerPaused, setAllSession } from "../../sessionsSlice";
import { appStartListening } from "../../../../listenerMiddleware";
import { assert } from "../../../../util";
import { fetchScopes, fetchStackTrace, fetchThreads, fetchVariables } from "../thunks";
import { ScopeEntity, StackFrameEntity, VariablesEntity } from "../../entities";
import { buildFlow } from "../../../flow/builders/default";
import { AppListenerEffectApi } from "../../../../listenerMiddleware";

async function defaultFetchSessionListener(action: ReturnType<typeof debuggerPaused>, api: AppListenerEffectApi) {
  // type guard from isAllOf isn't working for some reason, so assert it here
  assert(debuggerPaused.match(action));

  const sessionId = action.meta.sessionId;
  const debugType = action.meta.debugType;

  // fetch threads and wait to be fulfilled
  // TODO: handle reject
  const threadsResult = await api.dispatch(fetchThreads({ sessionId })).unwrap();
  const threads = threadsResult.threads;

  // fetch stack frames for each thread
  const stackFrames: StackFrameEntity[] = [];
  for (const thread of threads) {
    const stackTraceResult = await api.dispatch(fetchStackTrace({
      sessionId,
      threadId: thread.id
    })).unwrap();
    const frames = stackTraceResult.stackFrames;
    stackFrames.push(...frames);
    thread.stackFrameIds = frames.map((frame) => frame.id);
  }

  // fetch scopes for each stack frame
  const scopes: ScopeEntity[] = [];
  for (const frame of stackFrames) {
    const scopesResult = await api.dispatch(fetchScopes({
      sessionId,
      frameId: frame.id,
    })).unwrap();
    const scopeEntities = scopesResult.scopes;

    scopes.push(...scopeEntities);
    frame.scopeIds = scopeEntities.map((scope) => scope.pedagogId);
  }

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
      const variablesEntity = await api.dispatch(fetchVariables({
        sessionId,
        ...variablesArgs,
      })).unwrap();

      variables.push(variablesEntity);

      // fetch child variables as long as reference > 0
      const childRefs = variablesEntity.variables.map((v) => v.variablesReference).filter((ref) => ref > 0);
      refsToFetch.push(...childRefs);
      refsFetched.add(ref);
    }
    ref = refsToFetch.shift();
  }

  // done fetching everything, now we can set the session state and dispatch buildFlow
  const payload = { threads, stackFrames, scopes, variables };
  api.dispatch(setAllSession(sessionId, debugType, payload));
  api.dispatch(buildFlow({ sessionId }));
}

export function registerDefaultFetchSessionListener() {
  appStartListening({
    matcher: isAllOf(debuggerPaused.match, isUnknownDebugType),
    effect: async (action, api) => {
      assert(debuggerPaused.match(action));
      await defaultFetchSessionListener(action, api);
    },
  });
}
