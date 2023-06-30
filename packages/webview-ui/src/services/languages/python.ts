import { Effect, call, put, select } from "redux-saga/effects";
import { debugApi } from "../debugApi";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import {
  Session,
  SessionStateStackFrame,
  SessionStateThread,
  addScopes,
  addStackTrace,
  addThreads,
  addVariables,
  clearSession,
} from "../../features/sessions/sessionsSlice";
import { LanguageHandler } from "./base";
import { RootState } from "../../store";

class PythonLanguageHandler extends LanguageHandler {
  debugType = "python";

  *buildSessionSaga(sessionId: string): Generator<Effect> {
    yield put(clearSession({ id: sessionId }));

    const threads = (yield call(this.fetchThreadsSaga, sessionId)) as SessionStateThread[];

    const stackFrames = (yield call(
      this.fetchStackFramesSaga,
      sessionId,
      threads
    )) as SessionStateStackFrame[];

    // done needing threads, so we can dispatch them now
    yield put(addThreads({ id: sessionId, threads }));

    // now get scopes for each stack frame
    const scopes = (yield call(this.fetchScopesSaga, sessionId, stackFrames)) as DP.Scope[];

    // done modifying stack frames
    yield put(addStackTrace({ id: sessionId, frames: stackFrames }));

    yield put(addScopes({ id: sessionId, scopes }));

    for (const scope of scopes) {
      yield call(this.fetchVariablesSaga, sessionId, scope.variablesReference);
      // addVariables is dispatched inside fetchVariablesSaga
    }
  }

  *fetchThreadsSaga(sessionId: string): Generator<Effect, SessionStateThread[]> {
    const threadsResp = yield call(debugApi.getThreads, sessionId);
    const threads: SessionStateThread[] = (threadsResp as DP.ThreadsResponse["body"]).threads.map(
      (thread) => ({ ...thread, stackFrameIds: [] })
    );
    return threads;
  }

  *fetchStackFramesSaga(
    sessionId: string,
    threads: SessionStateThread[]
  ): Generator<Effect, SessionStateStackFrame[]> {
    const stackFrames: SessionStateStackFrame[] = [];
    for (const thread of threads) {
      const stackTraceResp = yield call(debugApi.getStackTrace, sessionId, { threadId: thread.id });
      const threadStackFrames = (stackTraceResp as DP.StackTraceResponse["body"]).stackFrames;
      thread.stackFrameIds = threadStackFrames.map((frame) => frame.id);
      stackFrames.push(
        ...threadStackFrames.map((frame) => ({ ...frame, scopeVariableReferences: [] }))
      );
    }
    return stackFrames;
  }

  *fetchScopesSaga(
    sessionId: string,
    stackFrames: SessionStateStackFrame[]
  ): Generator<Effect, DP.Scope[]> {
    let allScopes: DP.Scope[] = [];
    for (const frame of stackFrames) {
      const scopesResp = yield call(debugApi.getScopes, sessionId, { frameId: frame.id });
      let scopes = (scopesResp as DP.ScopesResponse["body"]).scopes;

      // always ignore "Global" scope
      scopes = scopes.filter((scope) => scope.name !== "Globals");

      // update scope reference in frame
      frame.scopeVariableReferences = scopes.map((scope) => scope.variablesReference);

      allScopes = [...allScopes, ...scopes];
    }
    return allScopes;
  }

  *fetchVariablesSaga(sessionId: string, variablesReference: number): Generator<Effect> {
    const varsResp = yield call(debugApi.getVariables, sessionId, { variablesReference });
    let variables = (varsResp as DP.VariablesResponse["body"]).variables;

    // ignore "special variables", "function variables", etc.
    const stateVariables = (yield select(
      (state: RootState) => state.sessions[sessionId].variables
    )) as Session["variables"];
    const existingRefs = Object.keys(stateVariables).map(Number);
    variables = variables.filter(
      ($var) => !$var.name.endsWith(" variables") && !existingRefs.includes($var.variablesReference)
    );

    // add variables to the state so the recursive call can check to see if one was already fetched
    yield put(addVariables({ id: sessionId, variables }));

    // recursively fetch nested variables
    for (const nextVar of variables) {
      yield call(this.fetchVariablesSaga, sessionId, nextVar.variablesReference);
    }
  }
}

export const pythonLanguageHandler = new PythonLanguageHandler();
