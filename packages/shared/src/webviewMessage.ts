import type { DebugRequest, DebugResponse, DebugEvent } from "./debugProtocol";
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
  | MessageData<"sessionStoppedEvent", { id: string }>
  | MessageData<"activeSessionChangedEvent", { id: string | null }>
  | MessageData<"showError", { msg: string | undefined }>;

export type WebviewMessageType = VsCodeMessage["type"];
export type WebviewMessageData = VsCodeMessage["data"];
