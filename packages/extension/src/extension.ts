import { commands, debug, ExtensionContext } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { PedagogicalDebugAdapterTrackerFactory } from "./debug-adapter-tracker";

export function activate(context: ExtensionContext) {
  const disposables = [
    // Create the show hello world command
    commands.registerCommand("hello-world.showHelloWorld", () => {
      HelloWorldPanel.render(context.extensionUri);
    }),

    // Register our debug adapter tracker to track the python debugger
    debug.registerDebugAdapterTrackerFactory(
      "*", // can also be "*" for all debuggers
      new PedagogicalDebugAdapterTrackerFactory()
    ),
  ];

  // Add disposables to the extension context
  context.subscriptions.push(...disposables);
}
