import { commands, debug, ExtensionContext } from "vscode";
import { PedagogicalPanel } from "./panels/PedagogicalPanel";
import { PedagogicalDebugAdapterTrackerFactory } from "./debugAdapterTracker";

export function activate(context: ExtensionContext) {
  const disposables = [
    // Create the show hello world command
    commands.registerCommand("hello-world.showHelloWorld", () => {
      PedagogicalPanel.render(context);
    }),

    debug.registerDebugAdapterTrackerFactory(
      "*", // can also be specific debuggers (e.g. "python")
      new PedagogicalDebugAdapterTrackerFactory()
    ),
  ];

  // Add disposables to the extension context
  context.subscriptions.push(...disposables);
}
