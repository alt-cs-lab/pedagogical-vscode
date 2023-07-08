import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { createEntityAdapter } from "@reduxjs/toolkit";

export type ThreadEntity = DP.Thread & {
  stackFrameIds: number[];
};

export type StackFrameEntity = DP.StackFrame & {
  threadId: number;
  scopeIds: (string | number)[];
};

export type ScopeEntity = DP.Scope & {
  pedagogId: string | number;
  stackFrameId: number;
};

export type VariablesReferenceEntity = DP.VariablesArguments & {
  pedagogId: string | number;
  variables: DP.Variable[];
};

export const threadsAdapter = createEntityAdapter<ThreadEntity>();

export const stackFramesAdapter = createEntityAdapter<StackFrameEntity>();

export const scopesAdapter = createEntityAdapter<ScopeEntity>({
  selectId: (scope) => scope.pedagogId,
});

export const variablesAdapter = createEntityAdapter<VariablesReferenceEntity>({
  selectId: (variable) => variable.pedagogId,
});

// TODO: normalize session instead of nesting these entities
