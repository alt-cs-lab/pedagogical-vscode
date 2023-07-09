import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { Session } from "../../sessionsSlice";

export type ThreadEntity = DP.Thread & {
  stackFrameIds: number[];
};

export const threadsAdapter = createEntityAdapter<ThreadEntity>();

export const threadSelectors = threadsAdapter.getSelectors((session: Session) => session.threads);

export function toThreadEntities(threads: DP.Thread[]): ThreadEntity[] {
  return threads.map((thread) => ({
    ...thread,
    stackFrameIds: [],
  }));
}