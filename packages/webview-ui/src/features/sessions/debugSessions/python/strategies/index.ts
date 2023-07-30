import defaultStrategies, { DebugSessionStrategies } from "../../default/strategies";
import pythonFetchVariablesStrategy from "./pythonFetchVariablesStrategy";

const pythonStrategies: DebugSessionStrategies = {
    ...defaultStrategies,
    fetchVariables: pythonFetchVariablesStrategy,
};

export default pythonStrategies;
