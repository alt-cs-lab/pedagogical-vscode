import type { RuleProperties } from "json-rules-engine";
import type { PedagogRuleEvent } from "shared/src/rules/events";
import { PedagogTopLevelCondition } from "./conditions";

export interface PedagogRule extends RuleProperties {
  name: string;
  conditions: PedagogTopLevelCondition;
  event: PedagogRuleEvent;
}

export type PedagogRuleSerializable = Pick<
  PedagogRule,
  "conditions" | "event" | "name" | "priority"
>;

export interface DebugSessionNamedRules {
  threadRules: string[];
  stackFrameRules: string[];
  scopeRules: string[];
  variableRules: string[];
}

export interface DebugSessionRules {
  threadRules: PedagogRuleSerializable[];
  stackFrameRules: PedagogRuleSerializable[];
  scopeRules: PedagogRuleSerializable[];
  variableRules: PedagogRuleSerializable[];
}
