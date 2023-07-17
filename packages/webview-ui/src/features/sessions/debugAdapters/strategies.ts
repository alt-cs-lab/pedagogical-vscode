import { DebugProtocol as DP } from "@vscode/debugprotocol";
import {
  ScopeEntity,
  StackFrameEntity,
  ThreadEntity,
  VariablesEntity,
} from "../entities";
import { pythonStrategies } from "./python/pythonStrategies";
import { defaultStrategies } from "./default/defaultStrategies";

type FilterPredicate<T> = Parameters<Array<T>["filter"]>[0];
export type ThreadsFilter = FilterPredicate<DP.Thread>;
export type StackFramesFilter = FilterPredicate<DP.StackFrame>;
export type ScopesFilter = FilterPredicate<DP.Scope>;
export type VariablesFilter = FilterPredicate<DP.Variable>;

export type ThreadsEntityConverter = (threads: DP.Thread) => ThreadEntity;
export type StackFrameEntityConverter = (frame: DP.StackFrame) => StackFrameEntity;
export type ScopeEntityConverter = (scope: DP.Scope) => ScopeEntity;
export type VariablesEntityConverter = (args: DP.VariablesArguments, resp: DP.VariablesResponse) => VariablesEntity;

export interface DebugTypeStrategies {
  filterThreads: ThreadsFilter;
  filterStackFrames: StackFramesFilter;
  filterScopes: ScopesFilter;
  filterVariables: VariablesFilter;

  toThreadEntity: (thread: DP.Thread) => ThreadEntity;
  toStackFrameEntity: (frame: DP.StackFrame, threadId: number) => StackFrameEntity;
  toScopeEntity: (scope: DP.Scope, stackFrameId: number) => ScopeEntity;
  toVariablesEntity: (args: DP.VariablesArguments, variables: DP.Variable[]) => VariablesEntity;
}

const debugTypeStrategiesMap: Record<string, DebugTypeStrategies> = {
  python: pythonStrategies
};

export function getStrategies(debugType: string) {
  return debugTypeStrategiesMap[debugType] ? debugTypeStrategiesMap[debugType] : defaultStrategies;
}
