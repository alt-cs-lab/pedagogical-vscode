import { AllConditions, AnyConditions, ConditionProperties, ConditionReference, NotConditions } from "json-rules-engine";
import { PedagogOperatorName } from "./operators";

// json-rules-engine types re-typed with stricter operator.
type PedagogConditionProperties = ConditionProperties & {
  operator: PedagogOperatorName;
};

type PedagogNestedCondition = PedagogConditionProperties | PedagogTopLevelCondition;

type PedagogAllConditions = AllConditions & {
  all: PedagogNestedCondition[];
};

type PedagogAnyConditions = AnyConditions & {
  any: PedagogNestedCondition[];
};

type PedagogNotConditions = NotConditions & {
  not: PedagogNestedCondition[];
};

export type PedagogTopLevelCondition =
  | PedagogAllConditions
  | PedagogAnyConditions
  | PedagogNotConditions
  | ConditionReference;
