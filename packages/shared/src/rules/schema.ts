import { DebugSessionNamedRules, PedagogRuleSerializable } from "./rules";

export interface PedagogicalRulesSchema {
  ruleDefinitions: PedagogRuleSerializable[];
  sessionRules: Record<string, DebugSessionNamedRules>;
}