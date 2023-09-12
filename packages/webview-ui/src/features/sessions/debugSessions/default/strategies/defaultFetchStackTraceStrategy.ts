import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import debugApi from "../../../debugApi";
import { StackFrameEntity, toStackFrameEntities } from "../../../entities";
import { addStackFrames } from "../defaultActions";

/**
 * Fetch the stack trace from the given thread id.
 * 
 * By default this fetches all stack frames and ignores frames with the
 * presentationHint "subtle" or "label".
 */
async function defaultFetchStackTraceStrategy(
  sessionId: string,
  threadId: number,
  api: AppListenerEffectApi,
): Promise<StackFrameEntity[]> {
  const resp = await debugApi.debugRequestAsync(sessionId, {
    command: "stackTrace",
    args: { threadId },
  });

  // filter out "subtle" and "label" frames
  const frames = resp.body.stackFrames.filter(
    (frame) =>
      frame.presentationHint !== "subtle" &&
      frame.presentationHint !== "label"
  );

  // the root of the stack is at the end of the array, but we want it at the beginning
  frames.reverse();
  
  const entities = toStackFrameEntities(threadId, frames);
  api.dispatch(addStackFrames(sessionId, { threadId, stackFrames: entities }));
  return entities;
}

export default defaultFetchStackTraceStrategy;