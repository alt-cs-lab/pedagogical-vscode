import { debugApi } from "../../../debugApi";
import { ThreadEntity, toThreadEntities } from "../../../entities";

/**
 * Fetch all threads from the debug adapter.
 */
export default async function defaultFetchThreadsStrategy(
  sessionId: string
): Promise<ThreadEntity[]> {
  const threadsResult = await debugApi.getThreads(sessionId);
  return toThreadEntities(threadsResult.threads);
}