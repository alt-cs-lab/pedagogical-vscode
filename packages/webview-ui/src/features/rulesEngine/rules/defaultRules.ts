import { DebugSessionRules, PedagogRule } from "./types";

/**
 * Accepts a stack frame if its presentationHint is undefined or "normal",
 * and rejects if it is "label" or "subtle".
 */
const defaultStackFrameAcceptRule: PedagogRule = {
  name: "defaultStackFrameAcceptRule",
  event: { type: "accept" },
  priority: 100,
  conditions: {
    any: [
      // stackFrame.presentationHint should be "normal" or undefined
      {
        fact: "stackFrame",
        path: "$.presentationHint",
        operator: "undefined",
        value: null,
      },
      {
        fact: "stackFrame",
        path: "$.presentationHint",
        operator: "equal",
        value: "normal",
      },
    ],
  },
};

/**
 * Accepts a scope if scope.expensive is not true,
 * and presentationHint is "locals" or the name starts with "Local".
 */
const defaultScopeAcceptRule: PedagogRule = {
  name: "defaultScopeAcceptRule",
  event: { type: "accept" },
  priority: 100,
  conditions: {
    all: [
      {
        // scope.expensive should be false or undefined
        fact: "scope",
        path: "$.expensive",
        operator: "notEqual",
        value: true,
      },
      {
        any: [
          {
            // scope.presentationHint should be "local"...
            fact: "scope",
            path: "$.presentationHint",
            operator: "equal",
            value: "local"
          },
          {
            // ...or scope.name should start with "Local"
            fact: "scope",
            path: "$.name",
            operator: "startsWith",
            value: "Local",
          },
        ],
      },
    ],
  },
};

/**
 * Sets the pedagogId of a variable to its memoryReference, if memoryReference is defined.
 */
const defaultVariableMemoryReferenceIdRule: PedagogRule = {
  name: "defaultVariableMemoryReferenceIdRule",
  event: {
    type: "setPedagogId",
    params: {
      fact: "variable",
      path: "$.memoryReference",
    },
  },
  conditions: {
    all: [
      {
        fact: "variable",
        path: "$.memoryReference",
        operator: "defined",
        value: null,
      },
    ],
  },
};

/**
 * Instructs Pedagogical to not fetch the children of a variable if:
 *  - its recursion depth is greater than 10, or
 *  - it is marked as "lazy"
 */
const defaultVariableSkipChildrenRule: PedagogRule = {
  name: "defaultVariableSkipChildrenRule",
  event: {
    type: "setFetchChildren",
    params: { value: false },
  },
  conditions: {
    any: [
      {
        fact: "variable",
        path: "$.presentationHint.lazy",
        operator: "equal",
        value: true,
      },
      {
        fact: "meta",
        path: "$.depth",
        operator: "greaterThan",
        value: 10,
      }
    ]
  }
};

export const defaultRules: DebugSessionRules = {
  threadRules: [],
  stackFrameRules: [defaultStackFrameAcceptRule],
  scopeRules: [defaultScopeAcceptRule],
  variableRules: [defaultVariableMemoryReferenceIdRule, defaultVariableSkipChildrenRule],
};
