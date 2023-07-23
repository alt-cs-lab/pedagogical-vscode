import defaultBuildFlowStrategy from "./defaultBuildFlowStrategy";
import defaultFetchScopesStrategy from "./defaultFetchScopesStrategy";
import defaultFetchSessionStrategy from "./defaultFetchSessionStrategy";
import defaultFetchStackTraceStrategy from "./defaultFetchStackTraceStrategy";
import defaultFetchThreadsStrategy from "./defaultFetchThreadsStrategy";
import defaultFetchVariablesStrategy from "./defaultFetchVariablesStrategy";

export type DebugSessionStrategies = typeof defaultStrategies;

const defaultStrategies = {
  fetchThreads: defaultFetchThreadsStrategy,
  fetchStackTrace: defaultFetchStackTraceStrategy,
  fetchScopes: defaultFetchScopesStrategy,
  fetchVariables: defaultFetchVariablesStrategy,
  fetchSession: defaultFetchSessionStrategy,
  buildFlow: defaultBuildFlowStrategy,
};

export default defaultStrategies;