import { RuleProperties } from "json-rules-engine";
import { PedagogRuleEvent } from "../events";

export interface PedagogRule extends RuleProperties {
  event: PedagogRuleEvent;
}

export interface DebugSessionRules {
  threadRules: RuleProperties[];
  stackFrameRules: RuleProperties[];
  scopeRules: RuleProperties[];
  variableRules: RuleProperties[];
}