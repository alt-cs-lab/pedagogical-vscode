import { Effect, fork, select, takeEvery } from "redux-saga/effects";
import { Session } from "../../features/sessions/sessionsSlice";
import { RootState } from "../../store";
import { getLanguageHandler } from "../languages";
import { VsCodeMessage } from "shared";
import { EventChannel, eventChannel } from "redux-saga";
import { messageController } from "../../util";

function* handleVscodeMessageSaga(msg: VsCodeMessage): Generator<Effect> {
  let session;
  let handler;
  switch (msg.type) {
    case "sessionStartedEvent":
      handler = getLanguageHandler(msg.data.type);
      if (handler) {
        yield fork([handler, handler.sessionStartSaga], msg.data.id, msg.data.name, msg.data.type);
      }
      break;

    case "sessionStoppedEvent":
      session = (yield select((state: RootState) => state.sessions[msg.data.id])) as
        | Session
        | undefined;
      if (session) {
        handler = getLanguageHandler(session.type);
        if (handler) {
          yield fork([handler, handler.sessionTerminatedSaga], session.id);
        }
      }
      break;

    case "debugEvent":
      session = (yield select((state: RootState) => state.sessions[msg.data.sessionId])) as Session | undefined;
      if (session) {
        handler = getLanguageHandler(session.type);
        if (handler) {
          yield fork([handler, handler.debugEventSaga], session.id, msg.data.event);
        }
      }
      break;

    case "debugError":
      // TODO
      break;
  }
}

export default function* vscodeSaga(): Generator<Effect> {
  const vscodeMessageChannel: EventChannel<VsCodeMessage> = eventChannel((emitter) => {
    messageController.addObserver(emitter);
    return () => messageController.removeObserver(emitter);
  });

  yield takeEvery(vscodeMessageChannel, handleVscodeMessageSaga);
}