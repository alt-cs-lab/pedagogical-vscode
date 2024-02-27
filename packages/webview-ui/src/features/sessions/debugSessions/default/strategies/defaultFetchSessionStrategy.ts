import { DebugSessionStrategies } from ".";
import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import { SessionRulesEngine } from "../../../../rulesEngine/engines/sessionRulesEngine";
import { sessionsSelectors } from "../../../entities";
import * as defaultActions from "../defaultActions";

export default async function defaultFetchSessionStrategy(
  sessionId: string,
  strategies: DebugSessionStrategies,
  api: AppListenerEffectApi,
  stoppedThreadId?: number
): Promise<void> {
  api.dispatch(defaultActions.updateLastFetch(sessionId));

  const rootState = api.getState();
  const sessionEntity = sessionsSelectors.selectById(rootState.sessions.sessionEntities, sessionId)!;
  const sessionRulesEngine = new SessionRulesEngine(rootState.rules, sessionEntity);

  // Fetch threads
  const acceptedThreads = await strategies.fetchThreads(
    sessionId,
    sessionRulesEngine,
    api,
    stoppedThreadId
  );

  // Fetch the stack trace for each accepted thread
  for (const acceptedThread of acceptedThreads) {
    // Skip if the accepted thread didn't give us stack trace arguments
    if (!acceptedThread.stackTraceArgs) {
      continue;
    }

    // Fetch stack frames
    const acceptedStackFrames = await strategies.fetchStackTrace(
      sessionId,
      sessionRulesEngine,
      api,
      acceptedThread.entity,
      acceptedThread.stackTraceArgs
    );

    // Fetch the scopes for each accepted stack frame
    for (const acceptedStackFrame of acceptedStackFrames) {
      if (!acceptedStackFrame.scopesArgs) {
        continue;
      }

      // Fetch scopes
      const acceptedScopes = await strategies.fetchScopes(
        sessionId,
        sessionRulesEngine,
        api,
        acceptedThread.entity,
        acceptedStackFrame.entity,
        acceptedStackFrame.scopesArgs
      );

      for (const acceptedScope of acceptedScopes) {
        // skip if variablesArgs is undefined or variablesReference is zero
        if (!acceptedScope.variablesArgs?.variablesReference) {
          continue;
        }

        // fetchVariables will recursively fetch child variables and doesn't return anything.
        await strategies.fetchVariables(
          sessionId,
          sessionRulesEngine,
          api,
          acceptedThread.entity,
          acceptedStackFrame.entity,
          acceptedScope.entity,
          undefined, // no parent variable
          acceptedScope.variablesArgs,
          // TODO: get variables pedagogId from rules engine
          acceptedScope.entity.variablesReference.toString(),
          0
        );
      }
    }
  }
}
