import { messageController } from "./messageController";

/// Helper class to show information/error messages in vscode
export class MessageBox {
  static showInformation(msg: string) {
    messageController.postMessage({ type: "showInformation", data: { msg } });
  }

  static showError(msg: string) {
    messageController.postMessage({ type: "showError", data: { msg } });
  }
}
