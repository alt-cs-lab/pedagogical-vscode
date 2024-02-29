import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type StackFrameEntity = DP.StackFrame & {
  pedagogId: string;
  threadId: number;
  scopeIds: (string | number)[];
  frameIndex: number;
};

export const stackFramesAdapter = createEntityAdapter<StackFrameEntity>({
  selectId: (frame) => frame.pedagogId,
  sortComparer: (a, b) => {
    // The debug adapter returns the most recent stack frame first,
    // but we want to display the most recent stack frame last,
    // so sort by frameIndex descending
    return b.frameIndex - a.frameIndex;
  },
});

export const stackFrameSelectors = stackFramesAdapter.getSelectors();
