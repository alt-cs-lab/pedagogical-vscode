import { WebviewMessage } from "shared";
import { vscode } from "../util/vscode";
import AsyncLock from "async-lock";
import { addEvent } from "../features/events/eventsSlice";
import { store } from "../store";

type PromiseCallbacks = {
  resolve: (value: WebviewMessage) => void;
  reject: (error?: any) => void;
};

/**
 * Static class to help handle messages sent between this webview and vscode.
 * Use {@link postMessageAndWaitAsync} to send a message and wait for a response.
 */
export class MessageHandler {
  /** Map that resolves a response sequence number to its promise callbacks */
  static seqPromiseMap = new Map<number, PromiseCallbacks>();

  static lock = new AsyncLock();
  static msgSeqCounter = 0;

  /** Handle a message sent from the vscode extension */
  public static handleWindowMessage(ev: MessageEvent) {
    const msg = ev.data as WebviewMessage;
    if (msg.msgSeq) {
      // this is a reponse to an earlier request message
      MessageHandler.completeMessagePromise(msg.msgSeq, msg);
    } else {
      switch (msg.type) {
        case "debugEvent":
          store.dispatch(addEvent(msg.data));
          break;
      }
    }
  }

  /**
   * Post a message to the extension WebViewPanel and asynchronously wait for a response.
   * @param message The message to post.
   * @param timeout The time in ms to wait for a response before the promis is rejected.
   * @returns A Promise, resolved and returning a message response, or rejected due to an error or timeout.
   */
  public static postMessageAndWaitAsync(
    message: WebviewMessage,
    timeout = 1000
  ): Promise<WebviewMessage> {
    const msgSeq = ++this.msgSeqCounter;

    // Return a promise that can be awaited to wait for a response
    return new Promise((resolve, reject) => {
      // Map the sequence number to the resolve/reject callbacks so we know which callback to use when we get the response message.
      this.seqPromiseMap.set(msgSeq, { resolve, reject });
      vscode.postMessage({ msgSeq: msgSeq, ...message });

      // reject the promise if we never hear back
      setTimeout(
        () => this.completeMessagePromise(msgSeq, new Error("message timeout reached"), "reject"),
        timeout
      );
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
  public static async completeMessagePromise(
    msgSeq: number,
    value: any,
    result: "resolve" | "reject" = "resolve"
  ) {
    // Lock the map in case we get two sources accessing the same promise.
    // This probably isn't necessary but I don't want to worry about a race condition like this happening.
    await this.lock.acquire("key", (done) => {
      const callbacks = this.seqPromiseMap.get(msgSeq);
      // if undefined then this promise was already completed earlier
      if (callbacks) {
        callbacks[result](value);
        this.seqPromiseMap.delete(msgSeq);
      }
      // release the lock
      done();
    });
  }
}
