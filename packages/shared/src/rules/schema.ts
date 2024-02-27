import { DebugSessionNamedRules, PedagogRuleSerializable } from "./rules";

export interface PedagogicalRulesSchema {
  ruleDefinitions: PedagogRuleSerializable[];
  sessionRules: { [name: string]: DebugSessionNamedRules };
}
