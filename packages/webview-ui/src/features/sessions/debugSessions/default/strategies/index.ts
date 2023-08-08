import defaultBuildFlowStrategy from "./defaultBuildFlowStrategy";
import defaultFetchScopesStrategy from "./defaultFetchScopesStrategy";
import defaultFetchSessionStrategy from "./defaultFetchSessionStrategy";
import defaultFetchStackTraceStrategy from "./defaultFetchStackTraceStrategy";
import defaultFetchThreadsStrategy from "./defaultFetchThreadsStrategy";
import defaultFetchVariablesStrategy from "./defaultFetchVariablesStrategy";
import defaultLayoutNodesStrategy from "./defaultLayoutFlowStrategy";

export type DebugSessionStrategies = typeof defaultStrategies;

const defaultStrategies = {
  fetchThreads: defaultFetchThreadsStrategy,
  fetchStackTrace: defaultFetchStackTraceStrategy,
  fetchScopes: defaultFetchScopesStrategy,
  fetchVariables: defaultFetchVariablesStrategy,
  fetchSession: defaultFetchSessionStrategy,
  buildFlow: defaultBuildFlowStrategy,
  layoutFlow: defaultLayoutNodesStrategy,
};

export default defaultStrategies;