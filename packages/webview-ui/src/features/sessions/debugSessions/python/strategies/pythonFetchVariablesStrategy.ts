import { DebugProtocol as DP } from "@vscode/debugprotocol";
import debugApi from "../../../debugApi";
import { VariablesEntity, toVariablesEntity } from "../../../entities";

export default async function pythonFetchVariablesStrategy(
  sessionId: string,
  refsToFetch: number[],
  maxFetches = 100,
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

    // for now, filter out "[special/function/class] variables"
    entity.variables = entity.variables.filter(
      (variable) => !variable.name.endsWith(" variables")
    );
    variables.push(entity);

    // add child variables to queue
    // ignore refs we've already fetched and refs that are zero
    refsToFetch.push(
      ...entity.variables
        .map(($var) => $var.variablesReference)
        .filter((val) => val > 0 && refsFetched.indexOf(val) === -1)
    );

    refsFetched.push(ref);
    ref = refsToFetch.shift();

    if (++numFetches > maxFetches) {
      console.error(`performed maximum fetches! (${maxFetches})`);
    }
  }

  return variables;
}
