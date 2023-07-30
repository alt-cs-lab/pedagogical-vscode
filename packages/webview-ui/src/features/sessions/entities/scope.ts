import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type ScopeEntity = DP.Scope & {
  pedagogId: string;
  stackFrameId: number;
};

export const scopesAdapter = createEntityAdapter<ScopeEntity>({
  selectId: (scope) => scope.pedagogId,
});

export const scopeSelectors = scopesAdapter.getSelectors();

export function toScopeEntities(stackFrameId: number, scopes: DP.Scope[]): ScopeEntity[] {
  return scopes.map((scope) => ({
    pedagogId: `${stackFrameId}-${scope.name}`,
    stackFrameId,
    ...scope,
  }));
}
