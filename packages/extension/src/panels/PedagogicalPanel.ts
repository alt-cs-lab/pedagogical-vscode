import {
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn,
  ExtensionContext,
  ExtensionMode,
  DebugSession,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { VsCodeMessage, DebugRequest } from "shared";
import { DebugSessionMessageListener, DebugSessionController } from "../debugSessionController";

/**
 * This class manages the state and behavior of webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class PedagogicalPanel {
  public static currentPanel: PedagogicalPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _sessions: DebugSession[] = [];

  /**
   * The PedagogicalPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, context: ExtensionContext) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.html = this._getWebviewContent(this._panel.webview, context);

    this._setWebviewMessageListener(this._panel.webview);

    DebugSessionController.subscribe(this._onDebugSessionMessage);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(context: ExtensionContext) {
    if (PedagogicalPanel.currentPanel) {
      // If the webview panel already exists reveal it
      PedagogicalPanel.currentPanel._panel.reveal(ViewColumn.Beside);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel("showPedagogicalView", "Pedagogical", ViewColumn.Beside, {
        enableScripts: true,
        localResourceRoots: [Uri.joinPath(context.extensionUri, "dist")],
      });

      PedagogicalPanel.currentPanel = new PedagogicalPanel(panel, context);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    PedagogicalPanel.currentPanel = undefined;

    DebugSessionController.unsubscribe(this._onDebugSessionMessage);

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, context: ExtensionContext) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, context.extensionUri, ["dist", "webview-ui", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, context.extensionUri, ["dist", "webview-ui", "assets", "index.js"]);

    const nonce = getNonce();

    const isEnvDevelopment = context.extensionMode === ExtensionMode.Development;

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
            {"isEnvDevelopment": ${context.extensionMode === ExtensionMode.Development}}
          </script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: VsCodeMessage) => {
        switch (message.type) {
          case "debugRequest":
            this._handleDebugRequest(message.data.sessionId, message.data.req, message.msgSeq);
            break;
          case "showError":
            window.showErrorMessage(`Pedagogical error: ${message.data.msg}`);
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  private _postWebviewMessage(message: VsCodeMessage) {
    this._panel.webview.postMessage(message);
  }

  /** Forward a request from the webview to the DebugSessionController */
  private _handleDebugRequest(sessionId: string, req: DebugRequest, msgSeq?: number) {
    DebugSessionController.sendDebugRequest(sessionId, req).then((resp) => {
      this._postWebviewMessage({ type: "debugResponse", msgSeq, data: { sessionId, resp } });
    }).catch(() => {
      this._postWebviewMessage({ type: "debugError", msgSeq, data: {} });
    });
  }

  private _onDebugSessionMessage: DebugSessionMessageListener = (msg) => {
    switch (msg.type) {
      case "started":
        this._sessions.push(msg.session);
        this._postWebviewMessage({
          type: "sessionStartedEvent",
          data: { id: msg.session.id, name: msg.session.name, type: msg.session.type },
        });
        break;

      case "stopped":
        this._sessions = this._sessions.filter((session) => session.id !== msg.session.id);
        this._postWebviewMessage({
          type: "sessionStoppedEvent",
          data: { id: msg.session.id },
        });
        break;

      case "debugEvent":
        this._postWebviewMessage({
          type: "debugEvent",
          data: { sessionId: msg.session.id, event: msg.data.event },
        });
        break;
    }
  };
}
