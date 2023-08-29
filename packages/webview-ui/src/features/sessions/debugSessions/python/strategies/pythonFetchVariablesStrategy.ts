import { DebugProtocol as DP } from "@vscode/debugprotocol";
import debugApi from "../../../debugApi";
import { VariablesEntity, toVariablesEntity } from "../../../entities";
import { FetchVariablesContextArg } from "../../default/strategies/defaultFetchVariablesStrategy";

export default async function pythonFetchVariablesStrategy(
  ctx: FetchVariablesContextArg,
  maxDepth = 10,
  currentDepth = 0,
): Promise<VariablesEntity[]> {
  const variables: VariablesEntity[] = [];
  const refsFetched: number[] = ctx.refsFetched ? ctx.refsFetched : [];

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

    // TODO: evaluate id() in python to get unique id of object

    // for now, filter out "special variables", etc.
    varEntity.variables = varEntity.variables.filter(
      (variable) => !variable.name.endsWith(" variables"),
    );
    variables.push(varEntity);

    // for (const func of entity.variables.filter(($var) => $var.type === "function")) {
    //   const expr = `${func.name}.__code__.co_varnames[:${func.name}.__code__.co_argcount]`;
    //   const evalResp = await debugApi.debugRequestAsync(ctx.sessionId, {
    //     command: "evaluate",
    //     args: {
    //       expression: expr,
    //       frameId: ctx.frame.id,
    //     },
    //   });
    //   const funcSignature = func.name + evalResp.body.result.replaceAll("'", "").replace(",)", ")");

    //   const funcEntity: VariablesEntity = {
    //     pedagogId: funcSignature,
    //     variablesReference: func.variablesReference,
    //     variables: [{
    //       name: func.name,
    //       type: "function",
    //       value: funcSignature,
    //       variablesReference: 0,
    //     }],
    //   };
    //   variables.push(funcEntity);
    // }

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

    const childVars = await pythonFetchVariablesStrategy({
      ...ctx,
      refsToFetch: childRefsToFetch,
      refsFetched: refsFetched,
      variable: varEntity,
    });

    variables.push(...childVars);
  }

  return variables;
}
