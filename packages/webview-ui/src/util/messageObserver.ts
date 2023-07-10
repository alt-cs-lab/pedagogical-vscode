import { DebugEvent, VsCodeMessage } from "shared";
import { store } from "../store";
import { addSession, debuggerPaused, removeSession } from "../features/sessions/sessionsSlice";
import { messageController } from ".";

export function startMessageObserver() {
  messageController.addObserver(messageObserver);
}

function messageObserver(msg: VsCodeMessage) {
  switch (msg.type) {
    case "sessionStartedEvent":
      store.dispatch(addSession({
        sessionId: msg.data.id,
        name: msg.data.name,
        type: msg.data.type,
      }));
      return;

    case "sessionStoppedEvent":
      store.dispatch(removeSession({ sessionId: msg.data.id }));
      return;

    case "debugEvent":
      handleDebugEvent(msg.data.sessionId, msg.data.event);
      return;
  }
}

function handleDebugEvent(sessionId: string, event: DebugEvent) {
  switch (event.event) {
    case "stopped": {
      // const session = store.getState().sessions[sessionId];
      store.dispatch(debuggerPaused({ sessionId: sessionId }));
      return;
    }
  }
}
