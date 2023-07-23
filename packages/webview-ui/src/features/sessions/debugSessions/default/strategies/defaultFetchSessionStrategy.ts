import { DebugSessionStrategies } from ".";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity } from "../../../entities";

async function defaultFetchSessionStrategy(
  sessionId: string,
  strategies: DebugSessionStrategies,
): Promise<{
  threads: ThreadEntity[],
  stackFrames: StackFrameEntity[],
  scopes: ScopeEntity[],
  variables: VariablesEntity[],
}> {
  const threads = await strategies.fetchThreads(sessionId);
  const stackFrames: StackFrameEntity[] = [];
  for (const thread of threads) {
    const threadFrames = await strategies.fetchStackTrace(sessionId, thread.id);
    thread.stackFrameIds = threadFrames.map((frame) => frame.id);
    stackFrames.push(...threadFrames);
  }
  const scopes: ScopeEntity[] = [];
  for (const frame of stackFrames) {
    const frameScopes = await strategies.fetchScopes(sessionId, frame.id);
    frame.scopeIds = frameScopes.map((scope) => scope.pedagogId);
    scopes.push(...frameScopes);
  }
  const refs = scopes.map((scope) => scope.variablesReference);
  const variables = await strategies.fetchVariables(sessionId, refs);
  return { threads, stackFrames, scopes, variables };
}

export default defaultFetchSessionStrategy;
