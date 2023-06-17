import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { vscodeMessageQuery } from "./webviewMessageBaseQuery";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { DebugRequest, DebugResponse, WebviewMessage } from "shared";

function debugRequestMsg(req: DebugRequest): WebviewMessage {
  return { type: "debugRequest", data: req };
}

export const debugAdapterApi = createApi({
  reducerPath: "debugAdapterApi",
  baseQuery: vscodeMessageQuery,
  endpoints: (builder) => ({
    getVariables: builder.query<DebugResponse, DP.VariablesArguments>({
      query: (args) => debugRequestMsg({ command: "variables", args }),
    }),
    getThreads: builder.query<DebugResponse, undefined>({
      query: () => debugRequestMsg({ command: "threads", args: undefined }),
    }),
  }),
});

export const { useGetThreadsQuery, useGetVariablesQuery } = debugAdapterApi;
