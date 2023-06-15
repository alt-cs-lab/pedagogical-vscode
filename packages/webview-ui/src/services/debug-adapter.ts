import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { vscodeMessageQuery } from "./webview-message-base-query";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { DebugRequestArguments, WebviewMessage, DebugRequest } from "shared";

export const debugAdapterApi = createApi({
  reducerPath: "debugAdapterApi",
  baseQuery: vscodeMessageQuery,
  endpoints: (builder) => ({
    getVariables: builder.query<DP.VariablesResponse, DP.VariablesArguments>({
      query: (args) => args,
    }),
    getThreads: builder.query<DP.ThreadsResponse, DebugRequestArguments<"threads">>({
      query: () => { return { type: "debugRequest", data: { command: "threads" } as DebugRequest<"threads"> } as WebviewMessage<"debugRequest">; },
    }),
  }),
});

export const { useGetThreadsQuery, useGetVariablesQuery } = debugAdapterApi;
