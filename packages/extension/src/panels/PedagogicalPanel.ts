import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { DebugProtocol } from "@vscode/debugprotocol";
import { WebviewMessage, DebugRequest, DebugResponse, DebugEvent } from "shared";

export class PedagogicalPanel {
  //public static currentPanel: PedagogicalPanel | undefined;
  private panel: vscode.WebviewPanel;

  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.panel = vscode.window.createWebviewPanel(
      "showHelloWorld",
      "Pedagogical",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
      }
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.html = this.getWebviewContent(this.panel.webview, context);
    this.setWebviewMessageHandler();
  }

  public show() {
    this.panel.reveal(vscode.ViewColumn.Beside);
  }

  public dispose() {
    // Dispose of the current webview panel
    this.panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }

  private getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
    // CSS and JS file from the React build output
    const stylesUri = getUri(webview, context.extensionUri, [
      "dist",
      "webview-ui",
      "assets",
      "index.css",
    ]);
    const scriptUri = getUri(webview, context.extensionUri, [
      "dist",
      "webview-ui",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    const isEnvDevelopment = context.extensionMode === vscode.ExtensionMode.Development;

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            style-src ${webview.cspSource};
            script-src 'nonce-${nonce}';
            connect-src ${isEnvDevelopment ? "'self' ws:" : "none"}">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Pedagogical</title>
        </head>
        <body>
          <div id="root"></div>
          <script id="scriptData" type="application/json">
            {"isEnvDevelopment": ${context.extensionMode === vscode.ExtensionMode.Development}}
          </script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private setWebviewMessageHandler() {
    this.panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      switch (message.type) {
        case "ping":
          this.postWebviewMessage({
            msgSeq: message.msgSeq,
            type: "pong",
            data: "pong",
          });
          break;
        case "debugRequest":
          const responseBody = await this.processDebugRequest(message.data);
          this.postWebviewMessage({
            msgSeq: message.msgSeq,
            type: "debugResponse",
            data: { ...responseBody, command: message.data.command } as DebugResponse,
          });
          break;
        default:
          break;
      }
    });
  }

  private postWebviewMessage(message: WebviewMessage) {
    this.panel.webview.postMessage(message);
  }

  private async processDebugRequest(req: DebugRequest) {
    // TODO: handle error repsponses
    return (await vscode.debug.activeDebugSession?.customRequest(
      req.command,
      req.args
    )) as DebugProtocol.Response["body"];
  }

  /**
   * Process messages sent by the debug adapter tracker.
   * Should only track events here; responses are already handled in processDebugRequest.
   */
  public debugProtocolMessageHandler = (message: DebugProtocol.ProtocolMessage) => {
    console.log(message);
    if (message.type === "event") {
      this.postWebviewMessage({
        type: "debugEvent",
        data: message as unknown as DebugEvent,
      });
    }
  };
}
