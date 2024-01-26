import { Engine, RuleProperties, EngineResult } from "json-rules-engine";
import { operators } from "../operators";

/**
 * Base rules engine wrapper for debug adapter objects.
 * A debug object is fed into the rules engine, then is returned,
 * possibly modified or removed based on the rules specified.
 */
export class BaseRulesEngine {
  protected engine: Engine;

  constructor(rules?: RuleProperties[]) {
    this.engine = new Engine(rules, {
      allowUndefinedConditions: true,
      allowUndefinedFacts: true,
    });

    // Add our custom operators
    for (const operator of operators) {
      this.engine.addOperator(operator);
    }

    this.engine.on("success", (event) => {
      // If the "stopRules" or "reject" succeeds, then stop the engine
      if (event.type === "stopRules" || event.type === "reject") {
        this.engine.stop();
      }
    });

    // If the "accept" rule fails, then immediately stop the engine as the object is rejected.
    this.engine.on("failure", (event) => {
      if (event.type === "accept") {
        this.engine.stop();
      }
    });
  }

  protected isRejected(engineResult: EngineResult): boolean {
    for (const ruleResult of engineResult.results) {
      if (ruleResult.result && ruleResult.event?.type === "reject") {
        // "reject" event succeeded
        return true;
      }
      else if (ruleResult.result === false && ruleResult.event?.type === "accept") {
        // "accept" event failed
        return true;
      }
    }
    return false;
  }
}