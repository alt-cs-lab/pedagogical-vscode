import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  DebugSessionNamedRules,
  DebugSessionRules,
  PedagogRuleSerializable,
} from "shared/src/rules";
import { MessageBox } from "../../util";

export interface RulesState {
  definitions: Record<string, PedagogRuleSerializable>;
  sessionRules: {
    _default: DebugSessionNamedRules;
    [debugType: string]: DebugSessionNamedRules;
  };
}

const initialState: RulesState = {
  definitions: {},
  sessionRules: {
    _default: {
      threadRules: [],
      stackFrameRules: [],
      scopeRules: [],
      variableRules: [],
    },
  },
};

const rulesSlice = createSlice({
  name: "rules",
  initialState: initialState,
  reducers: {
    addDefinitions: (state, action: PayloadAction<{ definitions: PedagogRuleSerializable[] }>) => {
      const defs: Record<string, PedagogRuleSerializable> =
        action.payload.definitions.reduce(
          (acc, rule) => ({ ...acc, [rule.name]: rule }),
          {}
        );
      state.definitions = {
        ...state.definitions,
        ...defs,
      };
    },
    addSessionRules: (state, action: PayloadAction<{ sessionRules: Record<string, DebugSessionNamedRules> }>) => {
      state.sessionRules = {
        ...state.sessionRules,
        ...action.payload.sessionRules,
      };
    },
  },
});

export function getDebugSessionRules(state: RulesState, debugType: string): DebugSessionRules {
  if (!Object.hasOwn(state.sessionRules, debugType)) {
    MessageBox.showInformation(`The debugger '${debugType}' is not supported, and Pedagogical may not work correctly.`);
    debugType = "_default";
  }
  const sessionNamedRules = state.sessionRules[debugType];

  // Make sure the named rules exist before trying to access them
  const names = [
    ...sessionNamedRules.threadRules,
    ...sessionNamedRules.stackFrameRules,
    ...sessionNamedRules.scopeRules,
    ...sessionNamedRules.variableRules,
  ];
  for (const name of names) {
    if (!Object.hasOwn(state.definitions, name)) {
      throw new Error(`Rule '${name}' does not exist.`);
    }
  }
  
  return {
    threadRules: sessionNamedRules.threadRules.map((name) => state.definitions[name]),
    stackFrameRules: sessionNamedRules.stackFrameRules.map((name) => state.definitions[name]),
    scopeRules: sessionNamedRules.scopeRules.map((name) => state.definitions[name]),
    variableRules: sessionNamedRules.variableRules.map((name) => state.definitions[name]),
  };
}

export default rulesSlice;
