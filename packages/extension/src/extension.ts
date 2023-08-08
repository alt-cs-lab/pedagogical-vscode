import { commands, debug, ExtensionContext, StatusBarAlignment, window } from "vscode";
import { PedagogicalPanel } from "./panels/PedagogicalPanel";
import { debugTrackerFactory } from "./debugTracker";
import DebugSessionController from "./DebugSessionController";


export function activate(context: ExtensionContext) {
  context.subscriptions.push(...[
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
  ]);

  // Status bar item to show the pedagogical view
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
  statusBarItem.name = "Pedagogical Button";
  statusBarItem.text = "$(open-preview) Pedagogical";
  statusBarItem.tooltip = "Show the Pedagogical debug flowchart";
  statusBarItem.command = "pedagogical.showPedagogicalView";
  DebugSessionController.subscribe((msg) => {
    if (msg.type === "started") {
      statusBarItem.show();
    } else if (msg.type === "stopped" && DebugSessionController.sessions.length === 0) {
      statusBarItem.hide();
    }
  });
  context.subscriptions.push(statusBarItem);
}