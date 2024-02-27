import type { DebugRequest, DebugResponse, DebugEvent } from "./debugProtocol";
import type { DebugProtocol } from "@vscode/debugprotocol";
import type { DebugSession } from "vscode";
import type { PedagogicalRulesSchema } from "./rules";

type MessageData<T extends string, D> = {
  type: T;
  data: D;
  msgSeq?: number;
};

type GetAllSessionsResponse = {
  activeSessionId: string | null;
  sessions: {
    name: string,
    type: string,
    id: string,
    lastPause: number,
  }[];
};

type AnyVsCodeMessage =
  | MessageData<"debugRequest", { sessionId: string, req: DebugRequest }>
  | MessageData<"debugResponse", { sessionId: string, resp: DebugResponse }>
  | MessageData<"debugEvent", { sessionId: string, event: DebugEvent }>
  | MessageData<"debugError", DebugProtocol.ErrorResponse["body"]>
  | MessageData<"sessionStartedEvent", Pick<DebugSession, "name" | "type" | "id">>
  | MessageData<"sessionStoppedEvent", { id: string }>
  | MessageData<"activeSessionChangedEvent", { id: string | null }>
  | MessageData<"getAllSessionsRequest", void>
  | MessageData<"getAllSessionsResponse", GetAllSessionsResponse>
  | MessageData<"showError", { msg: string }>
  | MessageData<"showInformation", { msg: string}>
  | MessageData<"workspaceRulesRequest", void>
  | MessageData<"workspaceRulesResponse", PedagogicalRulesSchema>;

export type VsCodeMessageType = AnyVsCodeMessage["type"];
export type VsCodeMessage<T extends VsCodeMessageType = VsCodeMessageType> = Extract<AnyVsCodeMessage, { type: T }>;
