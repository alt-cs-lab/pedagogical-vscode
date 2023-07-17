import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { Session } from "../sessionsSlice";

export type VariablesEntity = DP.VariablesArguments & {
  pedagogId: string;
  variables: DP.Variable[];
};

export const variablesAdapter = createEntityAdapter<VariablesEntity>({
  selectId: (variable) => variable.pedagogId,
});

export const variableSelectors = {
  ...variablesAdapter.getSelectors((session: Session) => session.variables),
  selectReferences: (session: Session) => Object.values(session.variables.entities).map((v) => v!.variablesReference),
  selectByReference: (session: Session, reference: number) => (
    Object.values(session.variables.entities).find((v) => v?.variablesReference === reference)
  ),
};
