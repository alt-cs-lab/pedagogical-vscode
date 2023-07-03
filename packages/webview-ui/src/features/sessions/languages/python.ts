import { Effect, call, put, select } from "redux-saga/effects";
import { debugApi } from "../../../services/debugApi";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import {
  Session,
  SessionStackFrame,
  SessionThread,
  addScopes,
  addStackTrace,
  addThreads,
  addVariables,
  buildSessionDone,
  clearSession,
} from "../sessionsSlice";
import { baseLanguageHandler } from "./base";
import { RootState } from "../../../store";
import { DebugResponse } from "shared";

export const pythonLanguageHandler = {
  ...baseLanguageHandler,
  debugType: "python",
  buildSessionSaga,
};

function* buildSessionSaga(sessionId: string): Generator<Effect> {
  yield put(clearSession({ id: sessionId }));

  const thread = (yield call(fetchThreadSaga, sessionId)) as SessionThread;

  // thread is updated in fetchStackFramesSaga, so don't dispatch it yet
  const stackFrames = (yield call(fetchStackFramesSaga, sessionId, thread)) as SessionStackFrame[];

  // now we can dispatch it
  yield put(addThreads({ id: sessionId, threads: [thread] }));

  // now get scopes for each stack frame
  const scopes = (yield call(fetchScopesSaga, sessionId, stackFrames)) as DP.Scope[];

  // done modifying stack frames
  yield put(addStackTrace({ id: sessionId, frames: stackFrames }));

  yield put(addScopes({ id: sessionId, scopes }));

  for (const scope of scopes) {
    // addVariables is dispatched inside fetchVariablesSaga
    yield call(fetchVariablesSaga, sessionId, scope.variablesReference);
  }

  yield put(buildSessionDone({ id: sessionId }));
}

/** Fetch only one thread when debugging python */
function* fetchThreadSaga(sessionId: string): Generator<Effect, SessionThread | undefined> {
  const resp = (yield call(debugApi.getThreads, sessionId)) as DebugResponse;
  if (resp.command !== "threads") {
    throw new Error(`expected threads response, got ${resp.command} instead`);
  }

  const thread = resp.body.threads.at(0);
  return thread ? { ...thread, stackFrameIds: [] } : undefined;
}

function* fetchStackFramesSaga(sessionId: string, thread: SessionThread): Generator<Effect, SessionStackFrame[]> {
  const resp = (yield call(debugApi.getStackTrace, sessionId, { threadId: thread.id })) as DebugResponse;
  if (resp.command !== "stackTrace") {
    throw new Error(`expected stackTrace response, got ${resp.command} instead`);
  }

  const frames = resp.body.stackFrames;
  thread.stackFrameIds = frames.map((frame) => frame.id);
  return frames.map((frame) => ({ ...frame, scopeVariableReferences: [] }));
}

function* fetchScopesSaga(sessionId: string, stackFrames: SessionStackFrame[]): Generator<Effect, DP.Scope[]> {
  let allScopes: DP.Scope[] = [];
  for (const frame of stackFrames) {
    const resp = (yield call(debugApi.getScopes, sessionId, { frameId: frame.id })) as DebugResponse;
    if (resp.command !== "scopes") {
      throw new Error(`expected scopes response, got ${resp.command} instead`);
    }

    // always ignore "Global" scope
    const scopes = resp.body.scopes.filter((scope) => scope.name !== "Globals");

    // update scope reference in frame
    frame.scopeVariableReferences = scopes.map((scope) => scope.variablesReference);

    allScopes = [...allScopes, ...scopes];
  }
  return allScopes;
}

/**
 * Fetch variables from a variablesReference number, add them to the state, then recursively fetch nested variables.
 */
function* fetchVariablesSaga(sessionId: string, ref: number): Generator<Effect> {
  if (ref === 0) { return; }

  const resp = (yield call(debugApi.getVariables, sessionId, { variablesReference: ref })) as DebugResponse;
  if (resp.command !== "variables") {
    throw new Error(`expected variables response, got ${resp.command} instead`);
  }

  let variables = resp.body.variables;

  // ignore "special variables", "function variables", etc.
  // and variables that are already in the state
  const stateVariables = (yield select((state: RootState) => state.sessions[sessionId].variableRefs)) as Session["variableRefs"];
  const existingRefs = Object.keys(stateVariables).map(Number);
  variables = variables.filter(($var) =>
    !$var.name.endsWith(" variables") && !existingRefs.includes($var.variablesReference)
  );

  // add variables to the state so the recursive call can check to see if one was already fetched
  yield put(addVariables({ id: sessionId, ref, variables }));

  // recursively fetch nested variables
  for (const nextVar of variables) {
    yield call(fetchVariablesSaga, sessionId, nextVar.variablesReference);
  }
}
