import { PedagogRule } from "shared/src/rules";

/**
 * Only accept the "Locals" scope.
 */
const pythonScopeAcceptRule: PedagogRule = {
  name: "pythonScopeAcceptRule",
  event: { type: "accept" },
  priority: 100,
  conditions: {
    all: [
      {
        fact: "scope",
        path: "$.name",
        operator: "equal",
        value: "Locals",
      },
    ],
  },
};

/**
 * Accept a python variable as long as it's not special/function/class variables, a module, or a return value.
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

export default [
  pythonScopeAcceptRule,
  pythonVariableAcceptRule,
];
