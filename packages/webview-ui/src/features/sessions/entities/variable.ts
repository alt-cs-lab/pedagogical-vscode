import { EntityState, createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type VariablesEntity = DP.VariablesArguments & {
  pedagogId: string;
  variables: DP.Variable[];
};

export const variablesAdapter = createEntityAdapter<VariablesEntity>({
  selectId: (variable) => variable.pedagogId,
});

export const variableSelectors = {
  ...variablesAdapter.getSelectors(),
  selectReferences: (state: EntityState<VariablesEntity>): number[] => {
    return Object.values(state.entities).map((v) => v!.variablesReference);
  },
  selectByReference: (
    state: EntityState<VariablesEntity>,
    reference: number,
  ): VariablesEntity | undefined => {
    return Object.values(state.entities).find((v) => v?.variablesReference === reference);
  },
};
