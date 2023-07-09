import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { createEntityAdapter } from "@reduxjs/toolkit";
import { Session } from "../../sessionsSlice";

export type ThreadEntity = DP.Thread & {
  stackFrameIds: number[];
};

export type StackFrameEntity = DP.StackFrame & {
  threadId: number;
  scopeIds: (string | number)[];
};

export type ScopeEntity = DP.Scope & {
  pedagogId: string;
  stackFrameId: number;
};

export type VariablesEntity = DP.VariablesArguments & {
  pedagogId: string;
  variables: DP.Variable[];
};

export const threadsAdapter = createEntityAdapter<ThreadEntity>();

export const stackFramesAdapter = createEntityAdapter<StackFrameEntity>();

export const scopesAdapter = createEntityAdapter<ScopeEntity>({
  selectId: (scope) => scope.pedagogId,
});

export const variablesAdapter = createEntityAdapter<VariablesEntity>({
  selectId: (variable) => variable.pedagogId,
});

export function toThreadEntities(threads: DP.Thread[]): ThreadEntity[] {
  return threads.map((thread) => ({
    ...thread,
    stackFrameIds: [],
  }));
}

export function toStackFrameEntities(threadId: number, frames: DP.StackFrame[]): StackFrameEntity[] {
  return frames.map((frame) => ({
    ...frame,
    threadId,
    scopeIds: [],
  }));
}


export function toScopeEntities(stackFrameId: number, scopes: DP.Scope[]): ScopeEntity[] {
  return scopes.map((scope) => ({
    pedagogId: `${stackFrameId}-${scope.name}`,
    stackFrameId,
    ...scope,
  }));
}

export function toVariablesEntity(args: DP.VariablesArguments, variables: DP.Variable[]): VariablesEntity {
  return {
    pedagogId: args.variablesReference.toString(),
    ...args,
    variables,
  };
}

export const threadSelectors = threadsAdapter.getSelectors((session: Session) => session.threads);
export const stackFrameSelectors = stackFramesAdapter.getSelectors((session: Session) => session.stackFrames);
export const scopeSelectors = scopesAdapter.getSelectors((session: Session) => session.scopes);
export const variableSelectors = {
  ...variablesAdapter.getSelectors((session: Session) => session.variables),
  selectReferences: (session: Session) => Object.values(session.variables.entities).map((v) => v!.variablesReference),
  selectByReference: (session: Session, reference: number) => (
    Object.values(session.variables.entities).find((v) => v?.variablesReference === reference)
  ),
};