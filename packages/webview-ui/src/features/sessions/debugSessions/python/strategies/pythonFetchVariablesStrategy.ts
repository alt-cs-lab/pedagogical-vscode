import { DebugProtocol as DP } from "@vscode/debugprotocol";
import debugApi from "../../../debugApi";
import { VariablesEntity, toVariablesEntity } from "../../../entities";

export default async function pythonFetchVariablesStrategy(
  sessionId: string,
  refsToFetch: number[],
  maxFetches = 100,
  frameId?: number,
): Promise<VariablesEntity[]> {
  const variables: VariablesEntity[] = [];
  const refsFetched: number[] = [];

  let numFetches = 0;
  let ref = refsToFetch.shift();
  while (ref && numFetches <= maxFetches) {
    const args: DP.VariablesArguments = { variablesReference: ref };
    const resp = await debugApi.debugRequestAsync(sessionId, {
      command: "variables",
      args,
    });

    // by default the variable id is it's variablesReference number
    // not ideal because variablesReference has a limited lifetime
    const entity = toVariablesEntity(args, resp.body.variables);

    // TODO: evaluate id() in python to get unique id of object

    // for now, filter out "special variables"
    entity.variables = entity.variables.filter(
      (variable) => variable.name !== "special variables",
    );
    variables.push(entity);

    for (const func of entity.variables.filter(($var) => $var.type === "function")) {
      const expr = `${func.name}.__code__.co_varnames[:${func.name}.__code__.co_argcount]`;
      const evalResp = await debugApi.debugRequestAsync(sessionId, {
        command: "evaluate",
        args: {
          expression: expr,
          frameId: frameId,
        },
      });
      const funcSignature = func.name + evalResp.body.result.replaceAll("'", "").replace(",)", ")");

      const funcEntity: VariablesEntity = {
        pedagogId: funcSignature,
        variablesReference: func.variablesReference,
        variables: [{
          name: func.name,
          type: "function",
          value: funcSignature,
          variablesReference: 0,
        }],
      };
      variables.push(funcEntity);
    }

    // add child variables to queue
    // ignore refs we've already fetched and refs that are zero
    refsToFetch.push(...entity.variables.filter(($var) => 
      $var.type !== "function"
      && $var.variablesReference > 0
      && !refsFetched.includes($var.variablesReference)
    ).map(($var) => $var.variablesReference));

    refsFetched.push(ref);
    ref = refsToFetch.shift();

    if (++numFetches > maxFetches) {
      console.error(`performed maximum fetches! (${maxFetches})`);
    }
  }

  return variables;
}
