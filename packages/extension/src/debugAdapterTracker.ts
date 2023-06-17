import {
  DebugAdapterTracker,
  DebugAdapterTrackerFactory,
  DebugSession,
  ProviderResult,
  window,
} from "vscode";
import { DebugProtocol } from "@vscode/debugprotocol";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { DebugEvent } from "shared";

/** Debug adapter tracker factory to be registered with vscode */
export class PedagogicalDebugAdapterTrackerFactory implements DebugAdapterTrackerFactory {
  createDebugAdapterTracker(session: DebugSession): ProviderResult<DebugAdapterTracker> {
    return new PedagogicalDebugAdapterTracker(session);
  }
}

/**
 * Tracker attached to the debug adapter. Contains handlers for messages sent by the debug adapter.
 *
 * Messages are sent after the debugger requests them (i.e. the user requests a variable through the debug panel)
 * or whenever requested by this extension with `debugSession.customRequest(command, args)`.
 *
 * @see https://microsoft.github.io/debug-adapter-protocol/specification for the specification.
 */
class PedagogicalDebugAdapterTracker implements DebugAdapterTracker {
  private _session: DebugSession;

  constructor(session: DebugSession) {
    this._session = session;
  }

  onDidSendMessage(message: DebugProtocol.ProtocolMessage) {
    console.log(message);
    if (message.type === "event") {
      HelloWorldPanel.postWebviewMessage({
        type: "debugEvent",
        data: message as unknown as DebugEvent,
      });
    }
  }

  onError(error: Error) {
    window.showErrorMessage(`${error.name}: ${error.message}`);
  }

  onExit(code: number | undefined, signal: string | undefined) {
    window.showInformationMessage(`DAP exited: ${signal} (${code})`);
  }

  onWillStartSession() {
    window.showInformationMessage("Starting session");
  }

  onWillStopSession() {
    window.showInformationMessage("Stopping session");
  }
}
