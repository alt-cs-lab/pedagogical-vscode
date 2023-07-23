import { debugApi } from "../../../debugApi";
import { VariablesEntity, toVariablesEntity } from "../../../entities";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

/**
 * Fetch variables using the given reference numbers.
 * 
 * By default this fetches all nested variables and uses the variable's reference number
 * as its id. You will probably want to override this, because you might not want to fetch
 * every variable and you should probably use a different id because variablesReference
 * has a limited lifetime.
 */
async function defaultFetchVariablesStrategy(
  sessionId: string,
  refsToFetch: number[],
): Promise<VariablesEntity[]> {
  const variables: VariablesEntity[] = [];
  const refsFetched: number[] = [];

  let ref = refsToFetch.shift();
  while (ref) {
    const args: DP.VariablesArguments = { variablesReference: ref };
    const resp = await debugApi.getVariables(sessionId, args);

    // by default the variable id is it's variablesReference number
    // not ideal because variablesReference has a limited lifetime
    const entity = toVariablesEntity(args, resp.variables);
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
  }

  return variables;
}

export default defaultFetchVariablesStrategy;