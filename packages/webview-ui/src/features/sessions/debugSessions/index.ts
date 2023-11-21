import BaseSession from "./BaseSession";
import DefaultSession from "./default/DefaultSession";
import PythonSession from "./python/PythonSession";
import JavaSession from "./java/JavaSession";

type BaseSessionCtor = new (id: string, preloadedState?: any) => BaseSession;

const sessionClassByDebugType: Record<string, BaseSessionCtor> = {
  default: DefaultSession,
  python: PythonSession,
  java: JavaSession,
};

export function getSessionClassByDebugType(debugType: string): BaseSessionCtor {
  return sessionClassByDebugType[
    Object.hasOwn(sessionClassByDebugType, debugType) ? debugType : "default"
  ];
}

export function isDebugTypeSupported(debugType: string): boolean {
  return Object.hasOwn(sessionClassByDebugType, debugType);
}
