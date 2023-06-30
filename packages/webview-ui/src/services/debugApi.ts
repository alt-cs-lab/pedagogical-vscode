import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { vscodeMessenger } from "../util/vscodeMessenger";

export const debugApi = {
  async getThreads(sessionId: string) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "threads", args: undefined, sessionId },
    });
    return resp as unknown as DP.ThreadsResponse["body"];
  },

  async getStackTrace(sessionId: string, args: DP.StackTraceArguments) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "stackTrace", args, sessionId },
    });
    return resp as unknown as DP.StackTraceResponse["body"];
  },

  async getScopes(sessionId: string, args: DP.ScopesArguments) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "scopes", args, sessionId },
    });
    return resp as unknown as DP.ScopesResponse["body"];
  },

  async getVariables(sessionId: string, args: DP.VariablesArguments) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "variables", args, sessionId },
    });
    return resp as unknown as DP.VariablesResponse["body"];
  },
};
