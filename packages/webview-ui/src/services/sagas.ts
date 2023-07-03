import { Effect, ForkEffect, all, call, select, takeLatest } from "redux-saga/effects";
import { Session, buildSession } from "../features/sessions/sessionsSlice";
import { Action } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getLanguageHandler } from "./languages";
import vscodeSaga from "./vscode/sagas";

function* watchBuildSessionSaga(): Generator<ForkEffect> {
  yield takeLatest(buildSession.type, matchBuildSessionSaga);
}

/**
 * Match the `buildSession` action to the proper language handler and trigger its `buildSessionSaga`.
 */
function* matchBuildSessionSaga(action: Action): Generator<Effect> {
  if (buildSession.match(action)) {
    const session = (yield select((state: RootState) => state.sessions[action.payload.id])) as Session | undefined;
    if (session === undefined) { return; }
    const handler = getLanguageHandler(session.type);
    if (handler) {
      try {
        yield call([handler, handler.buildSessionSaga], action.payload.id);
      } catch (e) {
        console.log(`buildSession error: ${e}`);
      }
    }
  }
}

export function* rootSaga() {
  yield all([
    vscodeSaga(),
    watchBuildSessionSaga(),
  ]);
}
