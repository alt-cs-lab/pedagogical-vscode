// Custom operators to use with json-rules-engine conditions
import { Operator, OperatorEvaluator } from "json-rules-engine";
import { RegExpParams } from "shared/src/rules";

/**
 * Helper function that returns a negated operator evaluator.
 */
function not(fn: (a: any, b: any) => boolean) {
  return (a: any, b: any) => !fn(a, b);
}

/**
 * Checks if a string matches the given RegExp params.
 */
function matchesRegExpEval(factValue: unknown, params: RegExpParams): boolean {
  const factString = String(factValue);
  const regexp = RegExp(params.pattern, params.flags);
  return regexp.test(factString);
}

/**
 * Checks if a string starts with a substring.
 */
function startsWithEval(factValue: unknown, searchString: string) {
  return String(factValue).startsWith(searchString);
}

/**
 * Checks if a string ends with a substring.
 */
function endsWithEval(factValue: unknown, searchString: string) {
  return String(factValue).endsWith(searchString);
}

/**
 * Checks if a value is not undefined.
 */
function defined(factValue: unknown, _jsonValue: unknown) {
  return factValue !== undefined;
}

export const operatorEvaluators = {
  matchesRegExp: matchesRegExpEval,
  notMatchesRegExp: not(matchesRegExpEval),
  startsWith: startsWithEval,
  notStartsWith: not(startsWithEval),
  endsWith: endsWithEval,
  notEndsWith: not(endsWithEval),
  defined: defined,
  undefined: not(defined),
} satisfies Record<string, OperatorEvaluator<any, any>>;

export const operators = Object.entries(operatorEvaluators).map(
  ([name, evaluator]) =>
    new Operator(name, evaluator as OperatorEvaluator<any, any>)
);

/**
 * Operators that can be used with json-rules-engine,
 * including our custom operators and the the built-in ones.
 * (https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators)
 */
export type PedagogOperatorName =
  | "equal"
  | "notEqual"
  | "lessThan"
  | "lessThanInclusive"
  | "greaterThan"
  | "greaterThanInclusive"
  | "in"
  | "notIn"
  | "contains"
  | "doesNotContain"
  | keyof typeof operatorEvaluators;
