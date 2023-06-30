import { Effect, put } from "redux-saga/effects";
import { addSession, buildSession, removeSession } from "../../features/sessions/sessionsSlice";
import { DebugEvent } from "shared";

export abstract class LanguageHandler {
  /**
   * The name of the debug adapter (e.g. `python`).
   * This must match the type given by `DebugSession` in the extension package.
   */
  abstract debugType: string;

  /**
   * Saga triggered when a new debug session is launched in vscode. Default implementation
   * simply dispatches the {@link addSession} action.
   *
   * Override this saga if you need to add some additional initialization logic.
   * If you override this, make sure you still dispatch {@link addSession}.
   *
   * Note that this does NOT mean that we can start sending requests to the session.
   * We still have to wait for the debug adapter to initialize, and probably wait for
   * a `stopped` event before we request anything.
   *
   * @param id session id
   * @param name human-readable session name
   * @param type debug adapter type, same as {@link debugType}
   */
  *sessionStartSaga(id: string, name: string, type: string): Generator<Effect> {
    yield put(addSession({ id, name, type }));
  }

  /**
   * Saga triggered when a debug session has terminated and is about to disconnect.
   * Default implementation dispatches {@link removeSession}. Remember to dispatch
   * that action if you override this.
   *
   * @param id session id
   */
  *sessionTerminatedSaga(id: string): Generator<Effect> {
    yield put(removeSession({ id }));
  }

  /**
   * Saga triggered when the debug session emits an event. By default this only watches
   * for the `stopped` event and dispatches `buildSession` if it sees one.
   *
   * @param sessionId session id
   * @param event debug event
   */
  *debugEventSaga(sessionId: string, event: DebugEvent): Generator<Effect> {
    switch (event.event) {
      case "stopped":
        yield put(buildSession({ id: sessionId, type: this.debugType }));
    }
  }

  /**
   * Abstract saga that is called when the `buildSession` action is triggered and
   * the session's debug adapter type matches {@link debugType}.
   *
   * @param sessionId session id
   */
  abstract buildSessionSaga(sessionId: string): Generator<Effect>;
}
