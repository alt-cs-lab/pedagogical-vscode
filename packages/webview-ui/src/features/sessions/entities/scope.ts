import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { Session } from "../sessionsSlice";

export type ScopeEntity = DP.Scope & {
  pedagogId: string;
  stackFrameId: number;
};

export const scopesAdapter = createEntityAdapter<ScopeEntity>({
  selectId: (scope) => scope.pedagogId,
});

export const scopeSelectors = scopesAdapter.getSelectors((session: Session) => session.scopes);
