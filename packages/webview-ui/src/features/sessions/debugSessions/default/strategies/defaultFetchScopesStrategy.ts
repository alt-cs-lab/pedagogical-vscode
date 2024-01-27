import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import debugApi from "../../../debugApi";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import * as defaultActions from "../defaultActions";
import { SessionRulesEngine } from "../../../../rulesEngine/engines/sessionRulesEngine";
import { ThreadEntity, StackFrameEntity } from "../../../entities";
import { AcceptedScope } from "../../../../rulesEngine/engines/scopeRulesEngine";

/**
 * Fetch the scopes from the given stack frame id.
 * 
 * By default this fetches all scopes but only keeps scopes that begin with "Local".
 */
async function defaultFetchScopesStrategy(
  sessionId: string,
  sessionRulesEngine: SessionRulesEngine,
  api: AppListenerEffectApi,
  thread: ThreadEntity,
  stackFrame: StackFrameEntity,
  scopesArgs: DP.ScopesArguments
): Promise<AcceptedScope[]> {
  // Fetch the scopes
  const scopesResp = await debugApi.debugRequestAsync(sessionId, {
    command: "scopes",
    args: scopesArgs,
  });

  // Run each scope through the rules engine
  const acceptedScopes = [];
  for (const scope of scopesResp.body.scopes) {
    const acceptedScope = await sessionRulesEngine.evalScope(
      thread,
      stackFrame,
      scope
    );
    acceptedScope && acceptedScopes.push(acceptedScope);
  }

  // Add scopes to the state
  api.dispatch(
    defaultActions.addScopes(sessionId, {
      frameId: stackFrame.id,
      scopes: acceptedScopes.map((as) => as.entity),
    })
  );

  return acceptedScopes;
}

export default defaultFetchScopesStrategy;