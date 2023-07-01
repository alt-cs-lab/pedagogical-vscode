import type { DebugEvent, DebugRequest, DebugResponse } from "./debugProtocol";
import type { DebugProtocol } from "@vscode/debugprotocol";
import type { DebugSession } from "vscode";

type MessageData<T extends string, D> = {
  type: T;
  data: D;
  msgSeq?: number;
};

export type VsCodeMessage =
  | MessageData<"debugRequest", { sessionId: string, req: DebugRequest }>
  | MessageData<"debugResponse", { sessionId: string, resp: DebugResponse }>
  | MessageData<"debugEvent", { sessionId: string, event: DebugEvent }>
  | MessageData<"debugError", DebugProtocol.ErrorResponse["body"]>
  | MessageData<"sessionStartedEvent", Pick<DebugSession, "name" | "type" | "id">>
  | MessageData<"sessionStoppedEvent", { id: string }>;

export type WebviewMessageType = VsCodeMessage["type"];
export type WebviewMessageData = VsCodeMessage["data"];
