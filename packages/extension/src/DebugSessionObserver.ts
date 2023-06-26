import { DebugEvent } from "shared";
import { DebugSession } from "vscode";

export class DebugSessionObserver {
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

  static sendEvent(session: DebugSession, event: DebugEvent) {
    this.notify({ type: "debugEvent", session, data: { event } });
  }
}

export type DebugSessionMessageListener = (msg: DebugSessionMessage) => void;

type DebugSessionMessage =
  | { type: "started", session: DebugSession }
  | { type: "stopped", session: DebugSession }
  | { type: "debugEvent", session: DebugSession, data: { event: DebugEvent } };
