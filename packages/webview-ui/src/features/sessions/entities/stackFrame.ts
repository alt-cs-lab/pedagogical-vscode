import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type StackFrameEntity = DP.StackFrame & {
  pedagogId: string;
  threadId: number;
  scopeIds: (string | number)[];
};

export const stackFramesAdapter = createEntityAdapter<StackFrameEntity>({
  selectId: (frame) => frame.pedagogId,
});

export const stackFrameSelectors = stackFramesAdapter.getSelectors();

export function toStackFrameEntities(
  threadId: number,
  frames: DP.StackFrame[],
): StackFrameEntity[] {
  return frames.map((frame) => ({
    ...frame,
    threadId,
    scopeIds: [],
    pedagogId: frame.id.toString(),
  }));
}
