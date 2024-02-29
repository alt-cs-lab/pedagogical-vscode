import { AppListenerEffectApi } from "../../../../../listenerMiddleware";
import { SessionRulesEngine } from "../../../../rulesEngine/engines/sessionRulesEngine";
import debugApi from "../../../debugApi";
import { ThreadEntity } from "../../../entities";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import * as defaultActions from "../defaultActions";
import { AcceptedStackFrame } from "../../../../rulesEngine/engines/stackFrameRulesEngine";

/**
 * Fetch the stack trace from the given thread id.
 *
 * By default this fetches all stack frames and ignores frames with the
 * presentationHint "subtle" or "label".
 */
async function defaultFetchStackTraceStrategy(
  sessionId: string,
  sessionRulesEngine: SessionRulesEngine,
  api: AppListenerEffectApi,
  thread: ThreadEntity,
  stackTraceArgs: DP.StackTraceArguments,
): Promise<AcceptedStackFrame[]> {
  // Fetch the stack frames
  const framesResp = await debugApi.debugRequestAsync(sessionId, {
    command: "stackTrace",
    args: stackTraceArgs,
  });

  // Run each stack frame through the rules engine
  const acceptedFrames = [];
  for (let i = 0; i < framesResp.body.stackFrames.length; i++) {
    const stackFrame = framesResp.body.stackFrames[i];
    const frameIndex = (stackTraceArgs.startFrame ?? 0) + i;
    const acceptedFrame = await sessionRulesEngine.evalStackFrame(thread, stackFrame, frameIndex);
    acceptedFrame && acceptedFrames.push(acceptedFrame);
  }

  // Add stack frames to the state
  api.dispatch(
    defaultActions.addStackFrames(sessionId, {
      threadId: thread.id,
      stackFrames: acceptedFrames.map((af) => af.entity),
    }),
  );

  return acceptedFrames;
}

export default defaultFetchStackTraceStrategy;
