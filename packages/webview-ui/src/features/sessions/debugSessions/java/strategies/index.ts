import defaultStrategies, { DebugSessionStrategies } from "../../default/strategies";
import javaBuildFlowStrategy from "./javaBuildFlowStrategy";
import javaFetchVariablesStrategy from "./javaFetchVariablesStrategy";

const javaStrategies: DebugSessionStrategies = {
  ...defaultStrategies,
  buildFlow: javaBuildFlowStrategy,
  fetchVariables: javaFetchVariablesStrategy,
};

export default javaStrategies;