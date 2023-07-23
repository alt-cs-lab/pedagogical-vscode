import { debugApi } from "../../../debugApi";
import { StackFrameEntity, toStackFrameEntities } from "../../../entities";

/**
 * Fetch the stack trace from the given thread id.
 * 
 * By default this fetches all stack frames and ignores frames with the
 * presentationHint "subtle" or "label".
 */
async function defaultFetchStackTraceStrategy(
  sessionId: string,
  threadId: number
): Promise<StackFrameEntity[]> {
  const stackTraceResult = await debugApi.getStackTrace(sessionId, { threadId });

  // filter out "subtle" and "label" frames
  const frames = stackTraceResult.stackFrames.filter(
    (frame) =>
      frame.presentationHint !== "subtle" &&
      frame.presentationHint !== "label"
  );
  return toStackFrameEntities(threadId, frames);
}

export default defaultFetchStackTraceStrategy;