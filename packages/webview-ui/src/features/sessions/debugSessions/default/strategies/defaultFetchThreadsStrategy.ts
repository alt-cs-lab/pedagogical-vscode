import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import { SessionRulesEngine } from "../../../../rulesEngine/engines/sessionRulesEngine";
import { AcceptedThread } from "../../../../rulesEngine/engines/threadRulesEngine";
import debugApi from "../../../debugApi";
import * as defaultActions from "../defaultActions";

/**
 * Fetch all threads from the debug adapter.
 */
export default async function defaultFetchThreadsStrategy(
  sessionId: string,
  sessionRulesEngine: SessionRulesEngine,
  api: AppListenerEffectApi,
  stoppedThreadId?: number,
): Promise<AcceptedThread[]> {
  // Fetch threads from the debug adapter
  const threadsResp = await debugApi.debugRequestAsync(sessionId, {
    command: "threads",
    args: undefined,
  });
  let threads = threadsResp.body.threads;

  // If the stopped threadId is given, filter so we only get that thread.
  if (stoppedThreadId !== undefined) {
    threads = threads.filter((t) => t.id === stoppedThreadId);
  }

  // Run the threads through the rules engine to get accept ThreadEntitys and StackFrameArguments
  const acceptedThreads = [];
  for (const thread of threads) {
    const acceptedThread = await sessionRulesEngine.evalThread(thread);
    acceptedThread && acceptedThreads.push(acceptedThread);
  }

  // Add threads to the state
  api.dispatch(
    defaultActions.addThreads(sessionId, {
      threads: acceptedThreads.map((at) => at.entity),
    }),
  );

  return acceptedThreads;
}
