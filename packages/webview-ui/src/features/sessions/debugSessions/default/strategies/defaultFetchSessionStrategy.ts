import { DebugSessionStrategies } from ".";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity } from "../../../entities";

async function defaultFetchSessionStrategy(
  sessionId: string,
  strategies: DebugSessionStrategies,
  threadId?: number,
): Promise<{
  threads: ThreadEntity[],
  stackFrames: StackFrameEntity[],
  scopes: ScopeEntity[],
  variables: VariablesEntity[],
}> {
  // fetch threads
  const threads = await strategies.fetchThreads(sessionId);

  // fetch stack trace from each thread
  // only fetch from threads that were stopped
  const stackFrames: StackFrameEntity[] = [];
  const stoppedThreads = threadId ? threads.filter((t) => t.id === threadId) : threads;
  for (const thread of stoppedThreads) {
    const threadFrames = await strategies.fetchStackTrace(sessionId, thread.id);
    thread.stackFrameIds = threadFrames.map((frame) => frame.id);
    stackFrames.push(...threadFrames);
  }

  // fetch scopes from frames
  // skip frames marked "deemphasize"
  const scopes: ScopeEntity[] = [];
  for (const frame of stackFrames.filter((frame) => frame.source?.presentationHint !== "deemphasize")) {
    const frameScopes = await strategies.fetchScopes(sessionId, frame.id);
    frame.scopeIds = frameScopes.map((scope) => scope.pedagogId);
    scopes.push(...frameScopes);
  }

  // fetch variables from scopes and fetch further nested variables
  // skip scopes marked as expensive
  const refs = scopes.filter((scope) => !scope.expensive).map((scope) => scope.variablesReference);
  const variables = await strategies.fetchVariables(sessionId, refs);
  return { threads, stackFrames, scopes, variables };
}

export default defaultFetchSessionStrategy;
