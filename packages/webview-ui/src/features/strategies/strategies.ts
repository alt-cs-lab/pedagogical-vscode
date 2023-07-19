import { DebugTypeStrategies } from "./strategyTypes";
import { defaultStrategies, pythonStrategies } from "./debugAdapters";

/**
 * Collection of strategies for each debug type.
 * Each key is the `debugType` string given by the `DebugSession` in vscode.
 */
export const strategiesByDebugType: Record<string, DebugTypeStrategies> = {
  python: pythonStrategies,
  default: defaultStrategies,
};

/**
 * Get the strategies for the given debug type.
 * If the debug type is not registered, defaultStrategies will be returned.
 */
export function getStrategies(
  debugType: string
): DebugTypeStrategies {
  return strategiesByDebugType[debugType]
    ? strategiesByDebugType[debugType]
    : strategiesByDebugType["default"];
}

export function isUnknownDebugType(debugType: string) {
  return strategiesByDebugType[debugType] === undefined;
}
