import { DebugTypeStrategies } from "../../strategyTypes";
import { defaultBuildFlowListener } from "./defaultBuildFlowListener";
import { defaultDebuggerPausedListener } from "./defaultDebuggerPausedListener";
import {
  defaultFetchThreadsStrategy,
  defaultFetchStackTraceStrategy,
  defaultFetchScopesStrategy,
  defaultFetchVariablesStrategy,
} from "./defaultFetchStrategies";

export const defaultStrategies: DebugTypeStrategies = {
  listeners: [
    defaultDebuggerPausedListener,
    defaultBuildFlowListener,
  ],

  fetchThreads: defaultFetchThreadsStrategy,
  fetchStackTraces: defaultFetchStackTraceStrategy,
  fetchScopes: defaultFetchScopesStrategy,
  fetchVariables: defaultFetchVariablesStrategy,
};
