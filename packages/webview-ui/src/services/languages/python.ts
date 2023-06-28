import { Effect, call, put } from "redux-saga/effects";
import { debugApi } from "../debugApi";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import {
  SessionStateStackFrame,
  SessionStateThread,
  addScopes,
  addThreads,
} from "../../features/sessions/sessionsSlice";
import { LanguageHandler } from "./base";

export const pythonLanguageHandler: LanguageHandler = {
  name: "python",

  *buildSessionAsync(id: string): Generator<Effect> {
    // first fetch threads
    const threadsResp = yield call(debugApi.getThreads);
    const threads: SessionStateThread[] = (threadsResp as DP.ThreadsResponse["body"]).threads.map(
      (thread) => ({ ...thread, stackFrameIds: [] })
    );

    const stackFrames: SessionStateStackFrame[] = [];

    // now get stack traces so we can include stack frame ids with each thread
    for (const thread of threads) {
      const stackTraceResp = yield call(debugApi.getStackTrace, { threadId: thread.id });
      const threadStackFrames = (stackTraceResp as DP.StackTraceResponse["body"]).stackFrames;
      thread.stackFrameIds = threadStackFrames.map((frame) => frame.id);
      stackFrames.push(...threadStackFrames.map((frame) => ({ ...frame, scopeIds: [] })));
    }

    // done fetching threads, so we can dispatch them now
    yield put(addThreads({ id, threads }));

    // now get scopes for each stack frame
    for (const frame of stackFrames) {
      const scopesResp = yield call(debugApi.getScopes, { frameId: frame.id });
      const scopes = (scopesResp as DP.ScopesResponse["body"]).scopes;
      // we don't need to add anything to the scopes, so we can dispatch them immediately
      yield put(addScopes({ id, scopes }));
    }
  },
};
