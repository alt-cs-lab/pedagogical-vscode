import { DebugEvent, DebugRequest, DebugResponse } from "./debugProtocol";

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
  | WebviewMessageMappedType<"debugEvent", DebugEvent>;

export type WebviewMessageType = WebviewMessage["type"];
export type WebviewMessageData = WebviewMessage["data"];
