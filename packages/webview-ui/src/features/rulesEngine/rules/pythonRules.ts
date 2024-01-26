import { DebugSessionRules, PedagogRule } from "./types";

/**
 * This rule accepts a python variable as long as it's not a "special" variable, module, or return value.
 */
const pythonVariableAcceptRule: PedagogRule = {
  name: "pythonVariableAcceptRule",
  event: { type: "accept" },
  priority: 100,
  conditions: {
    all: [
      {
        // The type of this variable should not be an empty string or "module".
        // Empty string means the variable is "special variables" or "function variables", etc.
        // "module" means this is probably an external module that we don't want to traverse.
        fact: "variable",
        path: "$.type",
        operator: "notIn",
        value: ["", "module"],
      },
      {
        // The variable entry should not be a return value
        fact: "variable",
        path: "$.name",
        operator: "notStartsWith",
        value: "(return) ",
      },
    ],
  },
};

export const pythonRules: DebugSessionRules = {
  threadRules: [],
  stackFrameRules: [],
  scopeRules: [],
  variableRules: [pythonVariableAcceptRule],
};
