import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import debugApi from "../../../debugApi";
import { ThreadEntity, toThreadEntities } from "../../../entities";
import { addThreads } from "../defaultActions";

/**
 * Fetch all threads from the debug adapter.
 */
export default async function defaultFetchThreadsStrategy(
  sessionId: string,
  api: AppListenerEffectApi,
): Promise<ThreadEntity[]> {
  const resp = await debugApi.debugRequestAsync(sessionId, {
      command: "threads",
      args: undefined,
    }
  );
  const entities = toThreadEntities(resp.body.threads);
  api.dispatch(addThreads(sessionId, { threads: entities }));
  return entities;
}