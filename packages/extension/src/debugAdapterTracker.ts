import * as vscode from "vscode";
import { DebugProtocol } from "@vscode/debugprotocol";

type OnDidSendMessageEvent = (message: DebugProtocol.ProtocolMessage) => void;

/** Debug adapter tracker factory to be registered with vscode */
export class PedagogicalDebugAdapterTrackerFactory implements vscode.DebugAdapterTrackerFactory {
  constructor(private onDidSendMessageEvent: OnDidSendMessageEvent) {}

  createDebugAdapterTracker(
    _session: vscode.DebugSession
  ): vscode.ProviderResult<vscode.DebugAdapterTracker> {
    return new PedagogicalDebugAdapterTracker(this.onDidSendMessageEvent);
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
class PedagogicalDebugAdapterTracker implements vscode.DebugAdapterTracker {
  constructor(public onDidSendMessage: OnDidSendMessageEvent) {}

  onError(error: Error) {
    vscode.window.showErrorMessage(`${error.name}: ${error.message}`);
  }

  onExit(code: number | undefined, signal: string | undefined) {
    vscode.window.showInformationMessage(`DAP exited: ${signal} (${code})`);
  }

  onWillStartSession() {
    vscode.window.showInformationMessage("Starting session");
  }

  onWillStopSession() {
    vscode.window.showInformationMessage("Stopping session");
  }
}
