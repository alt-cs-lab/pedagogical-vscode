import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type ThreadEntity = DP.Thread & {
  stackFrameIds: number[];
};

export const threadsAdapter = createEntityAdapter<ThreadEntity>();

export const threadSelectors = threadsAdapter.getSelectors();

export function toThreadEntities(threads: DP.Thread[]): ThreadEntity[] {
  return threads.map((thread) => ({
    ...thread,
    stackFrameIds: [],
  }));
}
