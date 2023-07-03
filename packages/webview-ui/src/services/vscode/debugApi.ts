import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { messageController } from "./messageController";
import { DebugResponse, VsCodeMessage } from "shared";

export const debugApi = {
  async getThreads(sessionId: string): Promise<DebugResponse> {
    const resp: VsCodeMessage = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "threads", args: undefined } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp;
  },

  async getStackTrace(sessionId: string, args: DP.StackTraceArguments): Promise<DebugResponse> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "stackTrace", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp;
  },

  async getScopes(sessionId: string, args: DP.ScopesArguments): Promise<DebugResponse> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "scopes", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp;
  },

  async getVariables(sessionId: string, args: DP.VariablesArguments): Promise<DebugResponse> {
    const resp = await messageController.postRequestAsync({
      type: "debugRequest",
      data: { sessionId, req: { command: "variables", args } },
    });
    if (resp.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${resp.type} instead`);
    }
    return resp.data.resp;
  },
};
