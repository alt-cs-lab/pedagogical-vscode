import createSagaMiddleware, { EventChannel, eventChannel } from "redux-saga";
import { Effect, ForkEffect, all, fork, select, takeEvery, takeLatest } from "redux-saga/effects";
import { Session, buildSession } from "../features/sessions/sessionsSlice";
import { pythonLanguageHandler } from "./languages/python";
import { LanguageHandler } from "./languages/base";
import { Action } from "@reduxjs/toolkit";
import { vscodeMessenger } from "../util";
import { VsCodeMessage as VscodeMessage } from "shared";
import { RootState } from "../store";

const languageHandlers: LanguageHandler[] = [pythonLanguageHandler];

function getLanguageHandler(type: string) {
  const handler = languageHandlers.find((handler) => handler.debugType === type);
  return handler;
}

function* watchBuildSessionSaga(): Generator<ForkEffect> {
  yield takeLatest(buildSession.type, matchBuildSessionSaga);
}

/**
 * Match the `buildSession` action to the proper language handler and trigger its
 * `buildSessionSaga`.
 */
function* matchBuildSessionSaga(action: Action): Generator<Effect> {
  if (buildSession.match(action)) {
    const handler = getLanguageHandler(action.payload.type);
    if (handler) {
      yield fork(handler.buildSessionSaga, action.payload.id);
    }
  }
}

function* watchVscodeMessageSaga() {
  const vscodeMessageChannel: EventChannel<VscodeMessage> = eventChannel((emitter) => {
    vscodeMessenger.addObserver(emitter);
    return () => vscodeMessenger.removeObserver(emitter);
  });
  yield takeEvery(vscodeMessageChannel, handleVscodeMessageSaga);
}

function* handleVscodeMessageSaga(msg: VscodeMessage): Generator<Effect> {
  let session;
  let handler;
  switch (msg.type) {
    case "sessionStartedEvent":
      handler = getLanguageHandler(msg.data.type);
      if (handler) {
        yield fork(handler.sessionStartSaga, msg.data.id, msg.data.name, msg.data.type);
      }
      break;

    case "sessionStoppedEvent":
      session = (yield select((state: RootState) => state.sessions[msg.data.id])) as
        | Session
        | undefined;
      if (session) {
        handler = getLanguageHandler(session.type);
        if (handler) {
          yield fork(handler.sessionTerminatedSaga, session.id);
        }
      }
      break;

    case "debugEvent":
      session = (yield select((state: RootState) => state.sessions[msg.data.sessionId])) as Session | undefined;
      if (session) {
        handler = getLanguageHandler(session.type);
        if (handler) {
          yield fork(handler.sessionTerminatedSaga, session.id);
        }
      }
      break;

    case "debugError":
      // TODO
      break;
  }
}

export function* rootSaga() {
  yield all([watchBuildSessionSaga(), watchVscodeMessageSaga()]);
}

export const sagaMiddleware = createSagaMiddleware();
