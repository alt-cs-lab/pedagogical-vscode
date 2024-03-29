import * as vscode from "vscode";
import { DebugProtocol } from "@vscode/debugprotocol";
import { DebugEvent } from "shared";
import DebugSessionController from "./DebugSessionController";

/** Debug adapter tracker factory to be registered with vscode */
export const debugTrackerFactory: vscode.DebugAdapterTrackerFactory = {
  createDebugAdapterTracker(session: vscode.DebugSession): vscode.ProviderResult<DebugTracker> {
    return new DebugTracker(session);
  },
};

class DebugTracker implements vscode.DebugAdapterTracker {
  constructor(private session: vscode.DebugSession) {
    console.log(`Registered "${session.type}" debug session tracker ${session.id}`);
  }

  onDidSendMessage(message: DebugProtocol.ProtocolMessage) {
    if (message.type === "event") {
      DebugSessionController.notifyEvent(this.session, message as unknown as DebugEvent);
    }
  }

  onWillStartSession() {
    DebugSessionController.addSession(this.session);
  }

  onWillStopSession() {
    DebugSessionController.removeSession(this.session);
  }
}
