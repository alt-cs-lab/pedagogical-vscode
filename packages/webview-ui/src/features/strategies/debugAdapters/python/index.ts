import { defaultStrategies } from "../default";
import { DebugTypeStrategies } from "../../strategyTypes";
import { pythonFetchVariablesStrategy } from "./pythonFetchStrategies";

export const pythonStrategies: DebugTypeStrategies = {
  ...defaultStrategies,

  fetchVariables: pythonFetchVariablesStrategy,
};
