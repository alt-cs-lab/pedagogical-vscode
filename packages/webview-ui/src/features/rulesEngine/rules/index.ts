import { pythonRules } from "./pythonRules";
import { DebugSessionRules } from "./types";

export { defaultRules } from "./defaultRules";

export const rulesPerDebugType: Record<string, DebugSessionRules> = {
  python: pythonRules,
  // TODO: read rules from configuration file
};
