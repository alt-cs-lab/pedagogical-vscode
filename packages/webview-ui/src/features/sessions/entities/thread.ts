import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type ThreadEntity = DP.Thread & {
  stackFrameIds: number[];
};

export const threadsAdapter = createEntityAdapter<ThreadEntity>();

export const threadSelectors = threadsAdapter.getSelectors();
