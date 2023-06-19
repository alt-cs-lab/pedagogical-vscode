import { DebugEvent, DebugRequest, DebugResponse } from "./debugProtocol";
import { DebugProtocol } from "@vscode/debugprotocol";

type WebviewMessageMappedType<T extends string, D> = {
  type: T;
  data: D;
  msgSeq?: number;
};

export type WebviewMessage =
  | WebviewMessageMappedType<"ping", "ping">
  | WebviewMessageMappedType<"pong", "pong">
  | WebviewMessageMappedType<"debugRequest", DebugRequest>
  | WebviewMessageMappedType<"debugResponse", DebugResponse>
  | WebviewMessageMappedType<"debugEvent", DebugEvent>
  | WebviewMessageMappedType<"debugError", DebugProtocol.ErrorResponse["body"]>;

export type WebviewMessageType = WebviewMessage["type"];
export type WebviewMessageData = WebviewMessage["data"];
