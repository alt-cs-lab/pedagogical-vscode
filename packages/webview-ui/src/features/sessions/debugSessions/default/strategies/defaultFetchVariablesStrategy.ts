import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import debugApi from "../../../debugApi";
import { ScopeEntity, StackFrameEntity, VariablesEntity, toVariablesEntity, variableSelectors } from "../../../entities";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { selectSessionState } from "../../../sessionsSlice";
import { addVariables } from "../defaultActions";

export type FetchVariablesContextArg = {
  sessionId: string,
  frame: StackFrameEntity,
  refsToFetch: number[],
  variable?: VariablesEntity,
  scope?: ScopeEntity,
  force?: boolean,
};

/**
 * Fetch variables using the given reference numbers.
 *
 * By default this fetches all nested variables and uses the variable's reference number
 * as its id. You will probably want to override this, because you might not want to fetch
 * every variable and you should probably use a different id because variablesReference
 * has a limited lifetime.
 */
export default async function defaultFetchVariablesStrategy(
  ctx: FetchVariablesContextArg,
  api: AppListenerEffectApi,
  maxDepth = 10,
  currentDepth = 0,
): Promise<VariablesEntity[]> {
  const variables: VariablesEntity[] = [];
  
  // get variableReferences that were already fetched
  const session = selectSessionState(api.getState(), ctx.sessionId);
  const refsFetched = variableSelectors.selectReferences(session.variables);

  for (const ref of ctx.refsToFetch) {
    // skip if ref is zero (not actually a ref)
    if (ref === 0) {
      continue;
    }

    const args: DP.VariablesArguments = { variablesReference: ref };
    const resp = await debugApi.debugRequestAsync(ctx.sessionId, {
      command: "variables",
      args,
    });

    refsFetched.push(ref);

    // by default the variable id is it's variablesReference number
    // not ideal because variablesReference has a limited lifetime
    const varEntity = toVariablesEntity(args, resp.body.variables);

    api.dispatch(addVariables(ctx.sessionId, { variables: [varEntity] }));
    variables.push(varEntity);

    // don't dive deeper if we reached maxDepth (to avoid very deeply or infinitely nested vars)
    if (currentDepth >= maxDepth) {
      continue;
    }

    // fetch child refs
    // ignore refs we've already fetched and refs that are zero
    // also ignore variables marked as lazy
    const childRefsToFetch = varEntity.variables.filter(($var) =>
      $var.variablesReference > 0
      && !refsFetched.includes($var.variablesReference)
      && !$var.presentationHint?.lazy
    ).map(($var) => $var.variablesReference);

    const childContextArgs: FetchVariablesContextArg = {
      ...ctx,
      refsToFetch: childRefsToFetch,
      variable: varEntity,
    };
    const childVars = await defaultFetchVariablesStrategy(childContextArgs, api, maxDepth, currentDepth + 1);

    variables.push(...childVars);
  }

  return variables;
}
