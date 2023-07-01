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
  buildSessionDone,
  clearSession,
} from "../../features/sessions/sessionsSlice";
import { LanguageHandler } from "./base";
import { RootState } from "../../store";
import { DebugResponse } from "shared";

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
      // include `this` context because fetchVariablesSaga needs to call itself recursively

      yield call([this, this.fetchVariablesSaga], sessionId, scope.variablesReference);
      // addVariables is dispatched inside fetchVariablesSaga
    }

    yield put(buildSessionDone({ id: sessionId }));
  }

  *fetchThreadsSaga(sessionId: string): Generator<Effect, SessionStateThread[]> {
    const resp = (yield call(debugApi.getThreads, sessionId)) as DebugResponse;
    if (resp.command !== "threads") {
      throw new Error(`expected threads response, got ${resp.command} instead`);
    }

    const threads: SessionStateThread[] = resp.body.threads.map(
      (thread) => ({ ...thread, stackFrameIds: [] })
    );
    return threads;
  }

  *fetchStackFramesSaga(sessionId: string, threads: SessionStateThread[]): Generator<Effect, SessionStateStackFrame[]> {
    const stackFrames: SessionStateStackFrame[] = [];
    for (const thread of threads) {
      const resp = (yield call(debugApi.getStackTrace, sessionId, { threadId: thread.id })) as DebugResponse;
      if (resp.command !== "stackTrace") {
        throw new Error(`expected stackTrace response, got ${resp.command} instead`);
      }

      const frames = resp.body.stackFrames;
      thread.stackFrameIds = frames.map((frame) => frame.id);
      stackFrames.push(
        ...frames.map((frame) => ({ ...frame, scopeVariableReferences: [] }))
      );
    }
    return stackFrames;
  }

  *fetchScopesSaga(sessionId: string, stackFrames: SessionStateStackFrame[]): Generator<Effect, DP.Scope[]> {
    let allScopes: DP.Scope[] = [];
    for (const frame of stackFrames) {
      const resp = (yield call(debugApi.getScopes, sessionId, { frameId: frame.id })) as DebugResponse;
      if (resp.command !== "scopes") {
        throw new Error(`expected scopes response, got ${resp.command} instead`);
      }

      let scopes = resp.body.scopes;

      // always ignore "Global" scope
      scopes = scopes.filter((scope) => scope.name !== "Globals");

      // update scope reference in frame
      frame.scopeVariableReferences = scopes.map((scope) => scope.variablesReference);

      allScopes = [...allScopes, ...scopes];
    }
    return allScopes;
  }

  *fetchVariablesSaga(sessionId: string, ref: number): Generator<Effect> {
    if (ref === 0) {
      return;
    }

    const resp = (yield call(debugApi.getVariables, sessionId, { variablesReference: ref })) as DebugResponse;
    if (resp.command !== "variables") {
      throw new Error(`expected variables response, got ${resp.command} instead`);
    }

    let variables = resp.body.variables;

    // ignore "special variables", "function variables", etc.
    const stateVariables = (yield select((state: RootState) => state.sessions[sessionId].variableRefs)) as Session["variableRefs"];
    const existingRefs = Object.keys(stateVariables).map(Number);
    variables = variables.filter(($var) =>
      !$var.name.endsWith(" variables") && !existingRefs.includes($var.variablesReference)
    );

    // add variables to the state so the recursive call can check to see if one was already fetched
    yield put(addVariables({ id: sessionId, ref, variables }));

    // recursively fetch nested variables
    for (const nextVar of variables) {
      yield call([this, this.fetchVariablesSaga], sessionId, nextVar.variablesReference);
    }
  }
}

export const pythonLanguageHandler = new PythonLanguageHandler();
