import { DebugSessionStrategies } from ".";
import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import * as defaultActions from "../defaultActions";

async function defaultFetchSessionStrategy(
  sessionId: string,
  strategies: DebugSessionStrategies,
  api: AppListenerEffectApi,
  threadId?: number,
): Promise<void> {
  api.dispatch(defaultActions.updateLastFetch(sessionId));
  
  // fetch threads
  const threads = await strategies.fetchThreads(sessionId, api);

  // fetch stack trace from each thread
  // only fetch from threads that were stopped
  const stoppedThreads = threadId ? threads.filter((t) => t.id === threadId) : threads;
  for (const thread of stoppedThreads) {
    const frames = await strategies.fetchStackTrace(sessionId, thread.id, api);
    
    // fetch scopes from frames
    // skip frames marked "deemphasize"
    for (const frame of frames.filter((frame) => frame.source?.presentationHint !== "deemphasize")) {
      const scopes = await strategies.fetchScopes(sessionId, frame.id, api);

      // fetch variables from scopes and fetch further nested variables
      // skip scopes marked as expensive
      for (const scope of scopes.filter((scope) => !scope.expensive)) {
        await strategies.fetchVariables({
          sessionId,
          frame,
          refsToFetch: [scope.variablesReference],
          scope,
        }, api);
      }
    }
  }
}

export default defaultFetchSessionStrategy;
