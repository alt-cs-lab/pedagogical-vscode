import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { vscodeMessenger } from "../util/vscodeMessenger";

export const debugApi = {
  async getThreads() {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "threads", args: undefined },
    });
    return resp as unknown as DP.ThreadsResponse["body"];
  },

  async getStackTrace(args: DP.StackTraceArguments) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "stackTrace", args },
    });
    return resp as unknown as DP.StackTraceResponse["body"];
  },

  async getScopes(args: DP.ScopesArguments) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "scopes", args },
    });
    return resp as unknown as DP.ScopesResponse["body"];
  },

  async getVariables(args: DP.VariablesArguments) {
    const resp = await vscodeMessenger.postRequestAsync({
      type: "debugRequest",
      data: { command: "variables", args },
    });
    return resp as unknown as DP.VariablesResponse["body"];
  },
};
