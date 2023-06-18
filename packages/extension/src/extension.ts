import { commands, debug, ExtensionContext } from "vscode";
import { PedagogicalPanel } from "./panels/PedagogicalPanel";
import { PedagogicalDebugAdapterTrackerFactory } from "./debugAdapterTracker";

export function activate(context: ExtensionContext) {
  const pedagogicalPanel = new PedagogicalPanel(context);

  const disposables = [
    // Create the show hello world command
    commands.registerCommand("hello-world.showHelloWorld", () => {
      pedagogicalPanel.show();
    }),

    debug.registerDebugAdapterTrackerFactory(
      "*", // can also be specific debuggers (e.g. "python")
      new PedagogicalDebugAdapterTrackerFactory(pedagogicalPanel.debugProtocolMessageHandler)
    ),
  ];

  // Add disposables to the extension context
  context.subscriptions.push(...disposables);
}
