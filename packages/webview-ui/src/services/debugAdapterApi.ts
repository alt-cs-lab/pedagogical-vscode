import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { vscodeBaseQuery } from "./vscodeBaseQuery";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { DebugRequest, WebviewMessage } from "shared";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";

export type GetSessionResponse = {
  threads: Record<number, DP.Thread>;
  stackFrames: Record<number, DP.StackFrame>;
  scopes: Record<number, DP.Scope[]>;
  /** array of variables associated with reference number */
  variables: Record<number, DP.Variable[] | null>;
};

export const debugAdapterApi = createApi({
  reducerPath: "debugAdapterApi",
  baseQuery: vscodeBaseQuery,
  endpoints: (builder) => ({
    /**
     * Performs the queries to get all threads, stack frames, scopes and variables and returns a DebugSessionState.
     */
    getSession: builder.query<GetSessionResponse, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const sessionResult: GetSessionResponse = {
          threads: {},
          stackFrames: {},
          scopes: {},
          variables: {},
        };

        // get threads
        // TODO: error handling
        const threadsResult = await baseQuery(
          debugRequestMsg({ command: "threads", args: undefined })
        );
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
        // TODO: handle paginated results
        const stackFrames = (stackTraceResult.data as DP.StackTraceResponse["body"]).stackFrames;

        // array of promises so scopes can be fetched asynchronously at the same time
        const scopesPromises: ReturnType<typeof fetchScopesWithFrameId>[] = [];

        for (const frame of stackFrames) {
          sessionResult.stackFrames[frame.id] = frame;
          scopesPromises.push(fetchScopesWithFrameId(baseQuery, frame.id));
        }

        const allScopes = await Promise.all(scopesPromises);

        // set to avoid pulling variable references more than once
        const variableRefSet = new Set<number>();
        let variablesPromises: ReturnType<typeof fetchVariablesWithRef>[] = [];

        for (const { frameId, scopes } of allScopes) {
          sessionResult.scopes[frameId] = scopes;
          for (const scope of scopes) {
            const ref = scope.variablesReference;
            variableRefSet.add(ref);
            variablesPromises.push(fetchVariablesWithRef(baseQuery, ref));
          }
        }

        const filterSkipNames = new Set(["special variables", "function variables"]);

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
                if (filterSkipNames.has(variable.name)) {
                  continue;
                }
                variablesPromises.push(fetchVariablesWithRef(baseQuery, ref));
              }
            }
          }
        }

        return { data: sessionResult };
      },
    }),
  }),
});

function debugRequestMsg(req: DebugRequest): WebviewMessage {
  return { type: "debugRequest", data: req };
}

async function fetchScopesWithFrameId(
  baseQuery: (arg: WebviewMessage) => MaybePromise<QueryReturnValue>,
  frameId: number
): Promise<{ frameId: number; scopes: DP.Scope[] }> {
  const result = await baseQuery(
    debugRequestMsg({
      command: "scopes",
      args: { frameId },
    })
  );
  const scopes = (result.data as DP.ScopesResponse["body"]).scopes;
  return { frameId, scopes };
}

// function to fetch variables while still keeping the ref number associated with it
async function fetchVariablesWithRef(
  baseQuery: (arg: WebviewMessage) => MaybePromise<QueryReturnValue>,
  ref: number
): Promise<{ ref: number; variables: DP.Variable[] }> {
  const result = await baseQuery(
    debugRequestMsg({
      command: "variables",
      args: { variablesReference: ref },
    })
  );
  const variables = (result.data as DP.VariablesResponse["body"]).variables;
  return { ref, variables };
}

export const { useGetSessionQuery } = debugAdapterApi;
