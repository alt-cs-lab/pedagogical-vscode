import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { ScopeEntity, StackFrameEntity, ThreadEntity, VariablesEntity } from "../entities";

type FilterPredicate<T> = Parameters<Array<T>["filter"]>[0];

export type ThreadsFilter = FilterPredicate<DP.Thread>;

export type StackFrameFilter = FilterPredicate<DP.StackFrame>;

export type ScopesFilter = FilterPredicate<DP.Scope>;

// TODO: variables filter somehow

export type ThreadsEntityMapFn = (threads: DP.Thread) => ThreadEntity;

export type StackFrameEntityMapFn = (frame: DP.StackFrame) => StackFrameEntity;

export type ScopeEntityMapFn = (scope: DP.Scope) => ScopeEntity;

export type VariablesToEntityFn = (args: DP.VariablesArguments, resp: DP.VariablesResponse) => VariablesEntity;
