import { DebugEvent, VsCodeMessage } from "shared";
import { store } from "../store";
import { messageController } from ".";
import { addSession, removeSession } from "../features/sessions/sessionsSlice";
import { debuggerPaused } from "../features/sessions/debugSessions/default/defaultActions";

export function startMessageObserver() {
  messageController.addObserver(messageObserver);
}

function messageObserver(msg: VsCodeMessage) {
  switch (msg.type) {
    case "sessionStartedEvent":
      store.dispatch(addSession({
        session: {
          id: msg.data.id,
          name: msg.data.name,
          debugType: msg.data.type,
        }
      }));
      return;

    case "sessionStoppedEvent": {
      store.dispatch(removeSession({ sessionId: msg.data.id }));
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
