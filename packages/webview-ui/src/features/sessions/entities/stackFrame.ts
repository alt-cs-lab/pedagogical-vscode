import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { Session } from "../sessionsSlice";

export type StackFrameEntity = DP.StackFrame & {
  threadId: number;
  scopeIds: (string | number)[];
};

export const stackFramesAdapter = createEntityAdapter<StackFrameEntity>();

export const stackFrameSelectors = stackFramesAdapter.getSelectors((session: Session) => session.stackFrames);

export function toStackFrameEntities(threadId: number, frames: DP.StackFrame[]): StackFrameEntity[] {
  return frames.map((frame) => ({
    ...frame,
    threadId,
    scopeIds: [],
  }));
}
