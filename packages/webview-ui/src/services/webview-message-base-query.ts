import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { vscode } from "../util/vscode";
import AsyncLock from "async-lock";
import { WebviewMessage } from "shared";

export const vscodeMessageQuery: BaseQueryFn = (message: WebviewMessage<any>): Promise<any> => {
  return MessageHandler.postMessageAndWaitAsync(message);
};

window.addEventListener("message", (ev) => {
  if (ev.data.seq) {
    MessageHandler.completeMessagePromise(ev.data.seq, ev.data);
  }
});

type PromiseCallbacks = {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
};

/**
 * Static class to help handle messages sent between this webview and vscode.
 * Use {@link postMessageAndWaitAsync} to send a message and wait for a response.
 *
 * ---
 *
 * ### How it works
 *
 * This class exists so we can treat vscode messages as if they were fetch requests,
 * so we can then use them with rtk-query to request things from the debug adapter.
 *
 * When `await postMessageAndWaitAsync(message)` is called:
 *
 * 1. A Promise is created later returned. The Promise has two callbacks, `resolve` and `reject`.
 * Calling one of those will end the Promise return a value or an error.
 *
 * 2. A unique sequence number is generated and saved to a map, pointing to those two callbacks.
 *
 * 3. The sequence number is added to the message and it is sent to vscode.
 *
 * 4. When the window gets a response with a sequence number, `completeMessagePromise` is called.
 *
 * 5. The function uses the sequence number to get the Promise callbacks from the original request message.
 *
 * 6. If everything is good, the `resolve` callback is called with the response message as the value,
 * and the Promise finally returns the value.
 */
class MessageHandler {
  /** Map that resolves a response sequence number to its promise callbacks */
  static seqPromiseMap = new Map<number, PromiseCallbacks>();

  /** Lock for reading items from the map */
  static lock = new AsyncLock();

  /** Incrementing counter for sequence numbers */
  static seqCounter = 0;

  /**
   * Post a message to the extension WebViewPanel and asynchronously wait for a response.
   * @param message The message to post.
   * @param timeout The time in ms to wait for a response before the promis is rejected.
   * @returns A Promise, resolved and returning a message response, or rejected due to an error or timeout.
   */
  public static postMessageAndWaitAsync(message: WebviewMessage<any>, timeout = 1000): Promise<any> {
    const seq = ++this.seqCounter;

    // Return a promise that can be awaited to wait for a response
    return new Promise((resolve, reject) => {
      // Map the sequence number to the resolve/reject callbacks so we know which callback
      // to use when we get the response message.
      this.seqPromiseMap.set(seq, { resolve, reject });

      // Send the message along with the sequence number.
      // The WebViewPanel will include this number in its response
      vscode.postMessage({ seq, ...message });

      // Set a timeout to reject the promise in case we never get the response.
      // This does nothing if we resolved the promise before the timeout is reached.
      setTimeout(
        () => this.completeMessagePromise(seq, new Error("message timeout reached"), "reject"),
        timeout
      );
    });
  }

  /**
   * Resolve or reject a promise created earlier, and remove it from the map.
   * This is called after the window receives a message responding to an earlier request.
   * This does nothing if the promise was resolved earlier.
   * @param seq The sequence number for the request that this message is responding to
   * @param value The value to return the promise with (message object for resolve, or Error for reject, etc.)
   * @param result "resolve" for success (default) or "reject" for error
   */
  public static async completeMessagePromise(
    seq: number,
    value: any,
    result: "resolve" | "reject" = "resolve"
  ) {
    // Lock the map in case we get two sources accessing the same promise.
    // This probably isn't necessary but I don't want to worry about a race condition like this happening.
    await this.lock.acquire("key", (done) => {
      const callbacks = this.seqPromiseMap.get(seq);
      // if undefined then this promise was already completed earlier
      if (callbacks) {
        callbacks[result](value);
        this.seqPromiseMap.delete(seq);
      }
      // release the lock
      done();
    });
  }
}
