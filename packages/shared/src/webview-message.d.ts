import { DebugProtocol } from "@vscode/debugprotocol";
import { DebugRequest } from "./debug-request";

type BaseMsg = {
  seq?: number;
};

type DebugRequestMsg = BaseMsg & {
  type: "debugRequest";
  data: DebugRequest;
};

type DebugResponseMsg = BaseMsg & {
  type: "debugResponse";
  data: DebugProtocol.Response;
};

type DebugTrackerMsg = BaseMsg & {
  type: "debugTrackerMessage";
  data: DebugProtocol.ProtocolMessage;
};

export type WebviewMessage = DebugRequestMsg | DebugResponseMsg | DebugTrackerMsg;
