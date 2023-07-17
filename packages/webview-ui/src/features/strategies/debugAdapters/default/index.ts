import { DebugTypeStrategies } from "../../strategies";
import { defaultDebuggerPausedListener } from "./defaultDebuggerPausedListener";
import {
  defaultFetchThreadsStrategy,
  defaultFetchStackTraceStrategy,
  defaultFetchScopesStrategy,
  defaultFetchVariablesStrategy,
} from "./defaultFetchStrategies";

export const defaultStrategies: DebugTypeStrategies = {
  listeners: [defaultDebuggerPausedListener],

  fetchThreads: defaultFetchThreadsStrategy,
  fetchStackTraces: defaultFetchStackTraceStrategy,
  fetchScopes: defaultFetchScopesStrategy,
  fetchVariables: defaultFetchVariablesStrategy,
};
