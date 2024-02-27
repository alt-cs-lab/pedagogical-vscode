import BaseSession from "./BaseSession";
import DefaultSession from "./default/DefaultSession";
import { SessionEntity } from "../entities";

type BaseSessionCtor = new (sessionEntity: SessionEntity, preloadedState?: any) => BaseSession;

const sessionClassByDebugType: Record<string, BaseSessionCtor> = {
  default: DefaultSession,
};

export function getSessionClassByDebugType(debugType: string): BaseSessionCtor {
  return sessionClassByDebugType[
    Object.hasOwn(sessionClassByDebugType, debugType) ? debugType : "default"
  ];
}
