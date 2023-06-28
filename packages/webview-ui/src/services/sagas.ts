import { eventChannel } from "redux-saga";
import { Effect, ForkEffect, all, fork, takeLatest } from "redux-saga/effects";
import { buildSession } from "../features/sessions/sessionsSlice";
import { pythonLanguageHandler } from "./languages/python";
import { LanguageHandler } from "./languages/base";
import { Action } from "@reduxjs/toolkit";
import { vscodeMessenger } from "../util";

const languageHandlers: LanguageHandler[] = [pythonLanguageHandler];

export function* watchBuildSessionAsync(): Generator<ForkEffect> {
  yield takeLatest(buildSession.type, buildSessionRootAsync);
}

export function* buildSessionRootAsync(action: Action): Generator<Effect> {
  if (buildSession.match(action)) {
    const handler = languageHandlers.find((handler) => handler.name === action.payload.type);
    if (handler) {
      yield fork(handler.buildSessionAsync, action.payload.id);
    }
  }
}

const vscodeMessageChannel = eventChannel((emitter) => {
  vscodeMessenger.addObserver(emitter);
  return () => vscodeMessenger.removeObserver(emitter);
});

export function* rootSaga() {
  yield all([]);
}
