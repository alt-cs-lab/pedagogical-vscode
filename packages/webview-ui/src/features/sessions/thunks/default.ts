import { debugApi } from "../../../services/debugApi";
import { Session, SessionScope, SessionStackFrame, SessionThread, SessionVariableRefs } from "../sessionsSlice";

export async function defaultFetchSession(session: Session) {
  // first fetch threads
  const threadsResp = await debugApi.getThreads(session.id);
  const threads: SessionThread[] = threadsResp.body.threads.map(
    (thread) => ({ ...thread, stackFrameIds: [] }),
  );

  // now fetch stack trace for each thread
  const stackFrames: SessionStackFrame[] = [];
  for (const thread of threads) {
    const stackTraceResp = await debugApi.getStackTrace(session.id, { threadId: thread.id });
    const threadStackFrames: SessionStackFrame[] = stackTraceResp.body.stackFrames.map(
      (frame) => ({ ...frame, scopeVariableReferences: [] }),
    );
    thread.stackFrameIds = threadStackFrames.map((frame) => frame.id);
    stackFrames.push(...threadStackFrames);
  }

  // now fetch scopes for each stack frame
  const scopes: SessionScope[] = [];
  for (const frame of stackFrames) {
    const scopesResp = await debugApi.getScopes(session.id, { frameId: frame.id });
    const frameScopes = scopesResp.body.scopes;
    frame.scopeVariableReferences = frameScopes.map((scope) => scope.variablesReference);
    scopes.push(...frameScopes);
  }

  // now fetch variables
  const variableRefs: SessionVariableRefs = {};
  for (const scope of scopes) {
    const variablesResp = await debugApi.getVariables(session.id, { variablesReference: scope.variablesReference });
    const variables = variablesResp.body.variables;
    variableRefs[scope.variablesReference] = variables;
  }

  return {
    ...session,
    threads,
    stackFrames,
    scopes,
    variableRefs,
  };
}