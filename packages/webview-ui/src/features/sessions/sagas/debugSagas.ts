import { all, call, put, select, takeLatest } from "redux-saga/effects";
import { Session, buildSession, buildSessionDone } from "../sessionsSlice";
import { Action } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { getLanguageHandler } from "../languages";
import vscodeSaga from "./messageSagas";
import { buildFlow } from "../../flow/flowSlice";

function* watchBuildSessionSaga() {
  yield takeLatest(buildSession.type, matchBuildSessionSaga);
}

/**
 * Match the `buildSession` action to the proper language handler and trigger its `buildSessionSaga`.
 */
function* matchBuildSessionSaga(action: Action) {
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

function* watchBuildSessionDoneSaga() {
  yield takeLatest(buildSessionDone.type, buildSessionDoneSaga);
}

function* buildSessionDoneSaga(action: Action) {
  if (buildSessionDone.match(action)) {
    const session = (yield select((state: RootState) => state.sessions[action.payload.id])) as Session | undefined;
    if (session) {
      yield put(buildFlow({ session }));
    }
  }
}

export function* rootSaga() {
  yield all([
    vscodeSaga(),
    watchBuildSessionSaga(),
    watchBuildSessionDoneSaga(),
  ]);
}
