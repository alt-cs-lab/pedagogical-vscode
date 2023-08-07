import BaseSession from "./BaseSession";
import DefaultSession from "./default/DefaultSession";
import PythonSession from "./python/PythonSession";

type BaseSessionCtor = new (id: string, preloadedState?: any) => BaseSession;

const sessionClassByDebugType: Record<string, BaseSessionCtor> = {
  python: PythonSession,
  default: DefaultSession,
};

export function getSessionClassByDebugType(debugType: string): BaseSessionCtor {
  return sessionClassByDebugType[
    Object.hasOwn(sessionClassByDebugType, debugType) ? debugType : "default"
  ];
}
