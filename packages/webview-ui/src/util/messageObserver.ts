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
      store.dispatch(addSession(msg.data));
      return;

    case "sessionStoppedEvent": {
      const session = store.getState().sessions[msg.data.id];
      if (session) {
        store.dispatch(removeSession(session.id, session.debugType));
      }
      return;
    }

    case "debugEvent":
      handleDebugEvent(msg.data.sessionId, msg.data.event);
      return;
  }
}

function handleDebugEvent(sessionId: string, event: DebugEvent) {
  switch (event.event) {
    case "stopped": {
      const session = store.getState().sessions[sessionId];
      if (session) {
        store.dispatch(debuggerPaused(session.id, session.debugType));
      }
      return;
    }
  }
}
