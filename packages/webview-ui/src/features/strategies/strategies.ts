import { AppListenerEffectApi } from "../../listenerMiddleware";
import {
  ScopeEntity,
  StackFrameEntity,
  ThreadEntity,
  VariablesEntity,
} from "../sessions/entities";
import { defaultStrategies, pythonStrategies } from "./debugAdapters";
import { MatchActionListener } from "./listeners";

export type FetchThreadsStrategy = (
  api: AppListenerEffectApi,
  sessionId: string
) => Promise<ThreadEntity[]>;

export type FetchStackTracesStrategy = (
  api: AppListenerEffectApi,
  sessionId: string,
  threads: ThreadEntity[]
) => Promise<StackFrameEntity[]>;

export type FetchScopesStrategy = (
  api: AppListenerEffectApi,
  sessionId: string,
  stackFrames: StackFrameEntity[]
) => Promise<ScopeEntity[]>;

export type FetchVariablesStrategy = (
  api: AppListenerEffectApi,
  sessionId: string,
  scopes: ScopeEntity[]
) => Promise<VariablesEntity[]>;

export interface DebugTypeStrategies {
  getListeners: MatchActionListener[];

  fetchThreads: FetchThreadsStrategy;
  fetchStackTraces: FetchStackTracesStrategy;
  fetchScopes: FetchScopesStrategy;
  fetchVariables: FetchVariablesStrategy;
}

export const strategiesByDebugType: Record<string, DebugTypeStrategies> = {
  python: pythonStrategies,

  default: defaultStrategies,
};

export function getStrategies(
  debugType: string
): DebugTypeStrategies {
  return strategiesByDebugType[debugType]
    ? strategiesByDebugType[debugType]
    : strategiesByDebugType["default"];
}

export function isUnknownDebugType(debugType: string) {
  return strategiesByDebugType[debugType] === undefined;
}
