import { defaultStrategies } from "../default";
import { DebugTypeStrategies } from "../strategies";
import { pythonFetchVariablesStrategy } from "./pythonFetchStrategies";

export const pythonStrategies: DebugTypeStrategies = {
  ...defaultStrategies,

  fetchVariables: pythonFetchVariablesStrategy,
};
