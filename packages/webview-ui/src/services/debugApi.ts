import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { messageController } from "../util/messageController";
import { VsCodeMessage } from "shared";

export const debugApi = {
  async getThreads(sessionId: string): Promise<DP.ThreadsResponse> {
    const resp: VsCodeMessage = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "threads", args: undefined } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp as DP.ThreadsResponse;
  },

  async getStackTrace(sessionId: string, args: DP.StackTraceArguments): Promise<DP.StackTraceResponse> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "stackTrace", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp as DP.StackTraceResponse;
  },

  async getScopes(sessionId: string, args: DP.ScopesArguments): Promise<DP.ScopesResponse> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "scopes", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp as DP.ScopesResponse;
  },

  async getVariables(sessionId: string, args: DP.VariablesArguments): Promise<DP.VariablesResponse> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "variables", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp as DP.VariablesResponse;
  },
};
