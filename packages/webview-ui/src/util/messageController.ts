import { VsCodeMessage } from "shared";
import { vscode } from "./vscode";
import AsyncLock from "async-lock";
import { isDevEnvironment } from "../store";

type PromiseCallbacks = {
  resolve: (value: any) => void;
  reject: (error?: any) => void;
};

function logDebugMessages(msg: VsCodeMessage) {
  if (msg.type === "debugRequest") {
    console.debug(msg.msgSeq, "-->", msg.data.req.command, msg.data.req.args);
  } else if (msg.type === "debugResponse") {
    console.debug(msg.msgSeq, "<--", msg.data.resp.command, msg.data.resp.body);
  }
}

/**
 * Class to help handle messages sent between this webview and vscode.
 * Use {@link postRequestAndWaitAsync} to send a message and wait for a response.
 */
class VsCodeMessageController {
  /** Map that resolves a response sequence number to its promise callbacks */
  seqPromiseMap = new Map<number, PromiseCallbacks>();

  lock = new AsyncLock();
  msgSeqCounter = 0;

  observers: ((msg: VsCodeMessage) => void)[] = [];

  constructor() {
    window.addEventListener("message", this.handleWindowMessage);
  }

  addObserver(callback: (msg: VsCodeMessage) => void) {
    this.observers.push(callback);
  }

  removeObserver(callback: (msg: VsCodeMessage) => void) {
    this.observers = this.observers.filter((cb) => cb !== callback);
  }

  /** Handle a message sent from the vscode extension */
  handleWindowMessage = (ev: MessageEvent) => {
    const msg = ev.data as VsCodeMessage;
    isDevEnvironment && logDebugMessages(msg);

    if (msg.msgSeq) {
      // this is a reponse to an earlier request message
      void this.completeMessagePromise(msg.msgSeq, msg);
    } else {
      this.observers.forEach((cb) => cb(msg));
    }
  };

  /**
   * Post a message to the extension WebViewPanel without waiting for a response.
   * @param message The message to post.
   */
  postMessage(message: VsCodeMessage) {
    isDevEnvironment && logDebugMessages(message);
    vscode.postMessage(message);
  }

  /**
   * Post a message to the extension WebViewPanel and asynchronously wait for a response.
   * @param message The message to post.
   * @param timeout The time in ms to wait for a response before the promis is rejected.
   * @returns A Promise, resolved and returning a message response, or rejected due to an error or timeout.
   */
  postRequestAndWaitAsync(message: VsCodeMessage, timeout = 1000): Promise<VsCodeMessage> {
    const msgSeq = ++this.msgSeqCounter;
    message.msgSeq = msgSeq;

    isDevEnvironment && logDebugMessages(message);

    return new Promise((resolve, reject) => {
      this.seqPromiseMap.set(msgSeq, { resolve, reject });
      vscode.postMessage(message);

      // reject if we never hear back
      setTimeout(() => {
        void this.completeMessagePromise(msgSeq, new Error("message timeout reached"), "reject");
      }, timeout);
    });
  }

  /**
   * Resolve or reject a promise created earlier, and remove it from the map.
   * This is called after the window receives a message responding to an earlier request.
   * This does nothing if the promise was resolved earlier.
   * @param msgSeq The sequence number for the request that this message is responding to
   * @param value The value to return the promise with (message object for resolve, or Error for reject, etc.)
   * @param result "resolve" for success (default) or "reject" for error
   */
  private async completeMessagePromise(
    msgSeq: number,
    value: any,
    result: "resolve" | "reject" = "resolve",
  ) {
    await this.lock.acquire("key", (done) => {
      const callbacks = this.seqPromiseMap.get(msgSeq);
      // if undefined then this promise was already completed earlier
      if (callbacks) {
        callbacks[result](value);
        this.seqPromiseMap.delete(msgSeq);
      }
      done();
    });
  }
}

export const messageController = new VsCodeMessageController();
