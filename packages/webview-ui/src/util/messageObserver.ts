import { DebugEvent, VsCodeMessage } from "shared";
import { store } from "../store";
import { messageController } from ".";
import { addSession, removeSession, setCurrentSession } from "../features/sessions/sessionsSlice";
import { debugEventAction } from "../features/sessions/debugEventActions";

export function startMessageObserver() {
  messageController.addObserver(messageObserver);
}

function messageObserver(msg: VsCodeMessage) {
  switch (msg.type) {
    case "sessionStartedEvent": {
      store.dispatch(addSession({
        session: {
          id: msg.data.id,
          name: msg.data.name,
          debugType: msg.data.type,
        }
      }));
      return;
    }

    case "sessionStoppedEvent": {
      store.dispatch(removeSession({ sessionId: msg.data.id }));
      return;
    }

    case "activeSessionChangedEvent": {
      store.dispatch(setCurrentSession({ sessionId: msg.data.id }));
      return;
    }

    case "debugEvent": {
      handleDebugEvent(msg.data.sessionId, msg.data.event);
      return;
    }
  }
}

function handleDebugEvent(sessionId: string, event: DebugEvent) {
  switch (event.event) {
    case "stopped": {
      store.dispatch(debugEventAction[event.event](sessionId, event));
      return;
    }
  }
}
