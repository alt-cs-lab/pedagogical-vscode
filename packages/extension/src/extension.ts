import { commands, debug, ExtensionContext } from "vscode";
import { PedagogicalPanel } from "./panels/PedagogicalPanel";
import { debugTrackerFactory } from "./debugTracker";
import DebugSessionController from "./DebugSessionController";

export function activate(context: ExtensionContext) {
  const disposables = [
    // Command to start the webview
    commands.registerCommand("pedagogical.showPedagogicalView", () => {
      PedagogicalPanel.render(context);
    }),

    debug.registerDebugAdapterTrackerFactory(
      "*", // can also be specific debuggers (e.g. "python")
      debugTrackerFactory
    ),
    debug.onDidChangeActiveDebugSession(
      DebugSessionController.activeSessionChangeListener,
      DebugSessionController,
    ),
  ];

  // Add disposables to the extension context
  context.subscriptions.push(...disposables);
}
