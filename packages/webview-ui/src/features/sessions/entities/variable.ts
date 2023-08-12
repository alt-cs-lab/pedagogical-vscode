import { EntityState, createEntityAdapter } from "@reduxjs/toolkit";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type VariablesEntity = DP.VariablesArguments & {
  pedagogId: string;
  variables: DP.Variable[];
};

export const variablesAdapter = createEntityAdapter<VariablesEntity>({
  selectId: (variable) => variable.pedagogId,
});

export function toVariablesEntity(args: DP.VariablesArguments, variables: DP.Variable[]): VariablesEntity {
  return {
    pedagogId: args.variablesReference.toString(),
    ...args,
    variables,
  };
}

export const variableSelectors = {
  ...variablesAdapter.getSelectors(),
  selectReferences: (state: EntityState<VariablesEntity>) => {
    return Object.values(state.entities).map((v) => v!.variablesReference);
  },
  selectByReference: (state: EntityState<VariablesEntity>, reference: number) => {
    return Object.values(state.entities).find((v) => v?.variablesReference === reference);
  }
};
