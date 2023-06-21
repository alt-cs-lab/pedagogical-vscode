import { FetchBaseQueryError, createApi } from "@reduxjs/toolkit/dist/query/react";
import { vscodeMessageQuery } from "./webviewMessageBaseQuery";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { DebugRequest, WebviewMessage } from "shared";
import { DebugSessionState } from "../features/debugSession/debugSessionSlice";

function debugRequestMsg(req: DebugRequest): WebviewMessage {
  return { type: "debugRequest", data: req };
}

export const debugAdapterApi = createApi({
  reducerPath: "debugAdapterApi",
  baseQuery: vscodeMessageQuery,
  endpoints: (builder) => ({
    // getScopes: builder.query<DP.ScopesResponse["body"], DP.ScopesArguments>({
    //   query: (args) => debugRequestMsg({ command: "scopes", args }),
    // }),

    // getStackTrace: builder.query<DP.StackTraceResponse["body"], DP.StackTraceArguments>({
    //   query: (args) => debugRequestMsg({ command: "stackTrace", args }),
    // }),

    // getThreads: builder.query<DP.ThreadsResponse["body"], undefined>({
    //   // threads has no arguments
    //   query: () => debugRequestMsg({ command: "threads", args: undefined }),
    // }),

    // getVariables: builder.query<DP.VariablesResponse["body"], DP.VariablesArguments>({
    //   query: (args) => debugRequestMsg({ command: "variables", args }),
    // }),

    /**
     * Performs the queries to get all threads, stack frames, scopes and variables and returns a DebugSessionState.
     */
    getSession: builder.query<DebugSessionState, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const sessionResult: DebugSessionState = {
          threads: {},
          stackFrames: {},
          scopes: {},
          variables: {},
        };

        // get threads
        const threadsResult = await baseQuery(
          debugRequestMsg({ command: "threads", args: undefined })
        );
        if (threadsResult.error) {
          return { error: threadsResult.error as FetchBaseQueryError };
        }
        const threads = (threadsResult.data as DP.ThreadsResponse["body"]).threads;

        if (threads === undefined || threads.length === 0) {
          return { data: sessionResult };
        }

        for (const thread of threads) {
          sessionResult.threads[thread.id] = thread;
        }

        // get stack trace
        // TODO?: handle multiple threads
        const stackTraceResult = await baseQuery(
          debugRequestMsg({ command: "stackTrace", args: { threadId: threads[0].id } })
        );
        if (stackTraceResult.error) {
          return { error: stackTraceResult.error as FetchBaseQueryError };
        }
        // TODO: handle paginated results
        const stackFrames = (stackTraceResult.data as DP.StackTraceResponse["body"]).stackFrames;

        // array of promises so scopes can be fetched asynchronously at the same time
        const scopesPromises: ReturnType<typeof baseQuery>[] = [];

        for (const frame of stackFrames) {
          sessionResult.stackFrames[frame.id] = frame;
          scopesPromises.push(
            baseQuery(debugRequestMsg({ command: "scopes", args: { frameId: frame.id } }))
          );
        }

        const scopesResults = await Promise.all(scopesPromises);

        // convert nested array of scope responses into a single array of scopes
        const scopes = scopesResults.reduce(
          (acc, scopesResult) =>
            acc.concat((scopesResult.data as DP.ScopesResponse["body"]).scopes),
          [] as DP.Scope[]
        );

        // function to fetch variables while still keeping the ref number associated with it
        const fetchVariablesWithRef = async (ref: number) => {
          const result = await baseQuery(
            debugRequestMsg({
              command: "variables",
              args: { variablesReference: ref },
            })
          );
          return { ref, variables: (result.data as DP.VariablesResponse["body"]).variables };
        };

        // set to avoid pulling variable references more than once
        const variableRefSet = new Set<number>();
        let variablesPromises: ReturnType<typeof fetchVariablesWithRef>[] = [];

        for (const scope of scopes) {
          const ref = scope.variablesReference;
          // TODO: scopes need to be keyed with the stack trace id
          sessionResult.scopes[ref] = scope;
          variableRefSet.add(ref);
          variablesPromises.push(fetchVariablesWithRef(ref));
        }

        // loop until all nested variables are covered
        while (variablesPromises.length > 0) {
          const variablesResults = await Promise.all(variablesPromises);
          variablesPromises = [];

          for (const { ref, variables } of variablesResults) {
            sessionResult.variables[ref] = variables;
            for (const variable of variables) {
              const ref = variable.variablesReference;
              // fetch the variable unless we already requested it earlier
              if (ref > 0 && !variableRefSet.has(ref)) {
                variableRefSet.add(ref);
                if (
                  variable.name === "special variables" ||
                  variable.name === "function variables"
                ) {
                  continue;
                }
                variablesPromises.push(fetchVariablesWithRef(ref));
              }
            }
          }
        }

        return { data: sessionResult };
      },
    }),
  }),
});

export const {
  // useGetScopesQuery,
  // useGetStackTraceQuery,
  // useGetVariablesQuery,
  // useGetThreadsQuery,
  useGetSessionQuery,
} = debugAdapterApi;
