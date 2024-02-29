import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import debugApi from "../../../debugApi";
import {
  ScopeEntity,
  StackFrameEntity,
  ThreadEntity,
  VariablesEntity,
  variableSelectors,
} from "../../../entities";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { SessionRulesEngine } from "../../../../rulesEngine/engines/sessionRulesEngine";
import * as defaultActions from "../defaultActions";
import { selectSessionState } from "../../../sessionsSlice";

/**
 * Fetch variables using the given reference numbers.
 */
export default async function defaultFetchVariablesStrategy(
  sessionId: string,
  sessionRulesEngine: SessionRulesEngine,
  api: AppListenerEffectApi,
  thread: ThreadEntity,
  stackFrame: StackFrameEntity,
  scope: ScopeEntity,
  parentVariable: DP.Variable | undefined,
  variablesArgs: DP.VariablesArguments,
  variablesPedagogId: string,
  depth: number,
): Promise<void> {
  // Make sure we didn't already fetch with this variablesReference number
  const sessionState = selectSessionState(api.getState(), sessionId);
  const existingEntity = variableSelectors.selectByReference(
    sessionState.variables,
    variablesArgs.variablesReference,
  );
  if (existingEntity) {
    return;
  }

  // Fetch the variables
  const variablesResp = await debugApi.debugRequestAsync(sessionId, {
    command: "variables",
    args: variablesArgs,
  });

  // Run each variable through the rules engine
  const acceptedVariables = [];
  for (const variable of variablesResp.body.variables) {
    const acceptedVariable = await sessionRulesEngine.evalVariable(
      thread,
      stackFrame,
      scope,
      parentVariable,
      variable,
      depth,
    );
    acceptedVariable && acceptedVariables.push(acceptedVariable);
  }

  // Add variables to the state
  const entity: VariablesEntity = {
    ...variablesArgs,
    pedagogId: variablesPedagogId,
    variables: acceptedVariables.map((av) => av.variable),
  };
  api.dispatch(defaultActions.addVariables(sessionId, { variables: [entity] }));

  // Recursively fetch child variables
  for (const acceptedVariable of acceptedVariables) {
    // skip if variablesArgs is undefined or variablesReference is zero
    if (acceptedVariable.variablesArgs?.variablesReference) {
      await defaultFetchVariablesStrategy(
        sessionId,
        sessionRulesEngine,
        api,
        thread,
        stackFrame,
        scope,
        acceptedVariable.variable,
        acceptedVariable.variablesArgs,
        acceptedVariable.pedagogId,
        depth + 1,
      );
    }
  }
}
