import { DebugEvent, DebugRequest, DebugResponse } from "shared";
import { DebugSession } from "vscode";

export class DebugSessionController {
  static listeners: DebugSessionMessageListener[] = [];
  static sessions: DebugSession[] = [];

  static subscribe(cb: DebugSessionMessageListener) {
    this.listeners.push(cb);
  }

  static unsubscribe(cb: DebugSessionMessageListener) {
    this.listeners = this.listeners.filter((l) => l !== cb);
  }

  static notify(msg: DebugSessionMessage) {
    this.listeners.forEach((cb) => cb(msg));
  }

  static addSession(session: DebugSession) {
    this.sessions.push(session);
    this.notify({ type: "started", session });
  }

  static removeSession(session: DebugSession) {
    this.sessions = this.sessions.filter((s) => s !== session);
    this.notify({ type: "stopped", session });
  }

  static notifyEvent(session: DebugSession, event: DebugEvent) {
    this.notify({ type: "debugEvent", session, data: { event } });
  }

  static activeSessionChangeListener(session: DebugSession | undefined) {
    this.notify({ type: "activeSessionChanged", session });
  }

  static async sendDebugRequest(sessionId: string, req: DebugRequest): Promise<DebugResponse> {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session === undefined) {
      throw new Error(`session id ${sessionId} not found`);
    }
    const respBody = await session.customRequest(req.command, req.args);
    return { command: req.command, body: respBody } as DebugResponse;
  }
}

export type DebugSessionMessageListener = (msg: DebugSessionMessage) => void;

type DebugSessionMessage =
  | { type: "started", session: DebugSession }
  | { type: "stopped", session: DebugSession }
  | { type: "debugEvent", session: DebugSession, data: { event: DebugEvent } }
  | { type: "activeSessionChanged", session: DebugSession | undefined };
