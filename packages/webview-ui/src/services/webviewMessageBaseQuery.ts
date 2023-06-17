import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { WebviewMessage } from "shared";
import { MessageHandler } from "./webviewMessageHandler";

export const vscodeMessageQuery: BaseQueryFn<WebviewMessage, unknown> = async (
  message: WebviewMessage
) => {
  const response = await MessageHandler.postMessageAndWaitAsync(message);
  return new Promise((resolve) => resolve({ data: response.data }));
};
