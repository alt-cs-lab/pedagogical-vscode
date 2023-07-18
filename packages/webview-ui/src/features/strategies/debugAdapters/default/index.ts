import { DebugTypeStrategies } from "../../strategies";
import { defaultBuildFlowListener } from "./defaultBuildFlowListener";
import { defaultDebuggerPausedListener } from "./defaultDebuggerPausedListener";
import {
  defaultFetchThreadsStrategy,
  defaultFetchStackTraceStrategy,
  defaultFetchScopesStrategy,
  defaultFetchVariablesStrategy,
} from "./defaultFetchStrategies";

export const defaultStrategies: DebugTypeStrategies = {
  getListeners: [
    defaultDebuggerPausedListener,
    defaultBuildFlowListener,
  ],

  fetchThreads: defaultFetchThreadsStrategy,
  fetchStackTraces: defaultFetchStackTraceStrategy,
  fetchScopes: defaultFetchScopesStrategy,
  fetchVariables: defaultFetchVariablesStrategy,
};
