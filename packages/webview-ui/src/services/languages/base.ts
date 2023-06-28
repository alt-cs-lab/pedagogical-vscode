import { Effect } from "redux-saga/effects";

export interface LanguageHandler {
  name: string;

  buildSessionAsync(sessionId: string): Generator<Effect>;
}
