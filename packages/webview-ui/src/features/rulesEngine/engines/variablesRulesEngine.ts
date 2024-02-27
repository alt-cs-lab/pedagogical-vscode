import {
  ScopeEntity,
  SessionEntity,
  StackFrameEntity,
  ThreadEntity,
} from "../../sessions/entities";
import { PedagogRuleEvent } from "shared/src/rules";
import { BaseRulesEngine } from "./baseRulesEngine";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

interface VariablesFacts {
  session: SessionEntity;
  thread: ThreadEntity;
  stackFrame: StackFrameEntity;
  scope: ScopeEntity;
  parentVariable?: DP.Variable;
  variable: DP.Variable;
  meta: {
    depth: number;
  };
}

export interface AcceptedVariable {
  variable: DP.Variable;
  variablesArgs?: DP.VariablesArguments;
  pedagogId: string;
}

export class VariablesRulesEngine extends BaseRulesEngine {
  async eval(facts: VariablesFacts): Promise<AcceptedVariable | null> {
    const result = await this.engine.run(facts);

    // Return null if the thread is rejected
    const failedAccept = result.failureEvents.find((event) => event.type === "accept");
    if (failedAccept) {
      return null;
    }

    let fetchChildren = true;
    const variablesArgs: DP.VariablesArguments = {
      variablesReference: facts.variable.variablesReference,
    };

    for (const event of result.events as PedagogRuleEvent[]) {
      switch (event.type) {
        case "setFetchChildren": {
          fetchChildren = event.params.value;
          break;
        }

        // TODO: handle other events
      }
    }

    return {
      variable: facts.variable,
      variablesArgs: fetchChildren ? variablesArgs : undefined,
      pedagogId: facts.variable.variablesReference.toString(),
    };
  }
}
