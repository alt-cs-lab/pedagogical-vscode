import debugApi from "../../../debugApi";
import { ScopeEntity } from "../../../entities";

/**
 * Fetch the scopes from the given stack frame id.
 * 
 * By default this fetches all scopes but only keeps scopes that begin with "Local".
 */
async function defaultFetchScopesStrategy(
  sessionId: string,
  frameId: number
): Promise<ScopeEntity[]> {
  const resp = await debugApi.debugRequestAsync(sessionId, {
    command: "scopes",
    args: { frameId },
  });

  // only keep names that begin with "Local"
  const scopes = resp.body.scopes.filter(
    (scope) => scope.name.startsWith("Local")
  );

  const entities: ScopeEntity[] = scopes.map((scope) => ({
    ...scope,
    stackFrameId: frameId,
    pedagogId: `${frameId}[${scope.name}]`,
  }));

  return entities;
}

export default defaultFetchScopesStrategy;