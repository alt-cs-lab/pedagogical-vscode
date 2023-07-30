import debugApi from "../../../debugApi";
import { ThreadEntity, toThreadEntities } from "../../../entities";

/**
 * Fetch all threads from the debug adapter.
 */
export default async function defaultFetchThreadsStrategy(
  sessionId: string
): Promise<ThreadEntity[]> {
  const resp = await debugApi.debugRequestAsync(sessionId, {
      command: "threads",
      args: undefined,
    }
  );
  return toThreadEntities(resp.body.threads);
}