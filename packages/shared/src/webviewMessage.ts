import type { DebugEvent, DebugRequest, DebugResponse } from "./debugProtocol";
import type { DebugProtocol } from "@vscode/debugprotocol";
import type { DebugSession } from "vscode";

type MessageData<T extends string, D> = {
  type: T;
  data: D;
  msgSeq?: number;
};

export type VsCodeMessage =
  | MessageData<"ping", "ping">
  | MessageData<"pong", "pong">
  | MessageData<"debugRequest", DebugRequest>
  | MessageData<"debugResponse", DebugResponse>
  | MessageData<"debugEvent", DebugEvent>
  | MessageData<"debugError", DebugProtocol.ErrorResponse["body"]>
  | MessageData<"sessionStartedEvent", Pick<DebugSession, "name" | "type" | "id">>
  | MessageData<"sessionStoppedEvent", { id: string }>;

export type WebviewMessageType = VsCodeMessage["type"];
export type WebviewMessageData = VsCodeMessage["data"];
