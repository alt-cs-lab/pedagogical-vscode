import { VariablesEntity, toVariablesEntity } from "../../../sessions/entities";
import { FetchVariablesStrategy } from "../../strategies";
import { fetchVariablesThunk } from "../../../sessions/thunks";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export const pythonFetchVariablesStrategy: FetchVariablesStrategy = async (api, sessionId, scopes) => {
  const refsToFetch: number[] = scopes.map((scope) => scope.variablesReference);
  const refsFetched = new Set<number>();

  const variables: VariablesEntity[] = [];
  let ref = refsToFetch.shift();
  while (ref) {
    if (!refsFetched.has(ref)) {
      const variablesArgs: DP.VariablesArguments = { variablesReference: ref };
      const variablesResp = await api.dispatch(fetchVariablesThunk({
        sessionId,
        ...variablesArgs,
      })).unwrap();

      // for now filter out "special variables", "function variables", and "class variables"
      // may change this later
      const filteredVariables = variablesResp.variables.filter(
        (v) => !v.name.endsWith(" variables")
      );

      // TODO: figure out a better id (by default it's the variablesReference, which changes each debug step)
      const variablesEntity = toVariablesEntity(variablesArgs, filteredVariables);

      variables.push(variablesEntity);

      // fetch child variables as long as reference > 0
      const childRefs = variablesEntity.variables.map((v) => v.variablesReference).filter((ref) => ref > 0);
      refsToFetch.push(...childRefs);
      refsFetched.add(ref);
    }
    ref = refsToFetch.shift();
  }

  return variables;
};
