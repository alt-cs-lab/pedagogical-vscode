import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { messageController } from "../../../util/messageController";
import { VsCodeMessage } from "shared";

export const debugApi = {
  async getThreads(sessionId: string): Promise<DP.ThreadsResponse["body"]> {
    const resp: VsCodeMessage = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "threads", args: undefined } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp.body as DP.ThreadsResponse["body"];
  },

  async getStackTrace(sessionId: string, args: DP.StackTraceArguments): Promise<DP.StackTraceResponse["body"]> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "stackTrace", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp.body as DP.StackTraceResponse["body"];
  },

  async getScopes(sessionId: string, args: DP.ScopesArguments): Promise<DP.ScopesResponse["body"]> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "scopes", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp.body as DP.ScopesResponse["body"];
  },

  async getVariables(sessionId: string, args: DP.VariablesArguments): Promise<DP.VariablesResponse["body"]> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "variables", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp.body as DP.VariablesResponse["body"];
  },
};
