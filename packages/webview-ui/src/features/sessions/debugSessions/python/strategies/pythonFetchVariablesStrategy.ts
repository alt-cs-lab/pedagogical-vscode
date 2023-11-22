import { DebugProtocol as DP } from "@vscode/debugprotocol";
import debugApi from "../../../debugApi";
import { VariablesEntity, toVariablesEntity, variableSelectors } from "../../../entities";
import { FetchVariablesContextArg } from "../../default/strategies/defaultFetchVariablesStrategy";
import { selectSessionState } from "../../../sessionsSlice";
import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import { addVariables } from "../../default/defaultActions";

export default async function pythonFetchVariablesStrategy(
  ctx: FetchVariablesContextArg,
  api: AppListenerEffectApi,
  maxDepth = 10,
  currentDepth = 0,
): Promise<VariablesEntity[]> {
  const variables: VariablesEntity[] = [];

  const session = selectSessionState(api.getState(), ctx.sessionId);
  const refsFetched: number[] = variableSelectors.selectReferences(session.variables);

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
    // TODO: if we need a better unique id, evaluate id() in python to get unique id of object
    const varEntity = toVariablesEntity(args, resp.body.variables);

    // for now, filter out "special variables", "function variables" and "class variables"
    // ignore imported modules (e.g. "numpy")
    // ignore "(return)" values
    varEntity.variables = varEntity.variables.filter((variable) => 
      !variable.name.endsWith(" variables")
      && variable.type !== "module"
      && !variable.name.startsWith("(return) ")
    );

    api.dispatch(addVariables(ctx.sessionId, { variables: [varEntity] }));
    variables.push(varEntity);

    if (currentDepth >= maxDepth) {
      continue;
    }

    // fetch child refs
    // ignore refs we've already fetched and refs that are zero
    const childRefsToFetch = varEntity.variables.filter(($var) => 
      $var.type !== "function"
      && $var.variablesReference > 0
      && !refsFetched.includes($var.variablesReference)
    ).map(($var) => $var.variablesReference);

    const childContextArgs: FetchVariablesContextArg = {
      ...ctx,
      refsToFetch: childRefsToFetch,
      variable: varEntity,
    };

    const childVars = await pythonFetchVariablesStrategy(childContextArgs, api, maxDepth, currentDepth + 1);

    variables.push(...childVars);
  }

  return variables;
}
