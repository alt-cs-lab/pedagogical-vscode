import { ScopeEntity, SessionEntity, StackFrameEntity, ThreadEntity } from "../../sessions/entities";
import { BaseRulesEngine } from "./baseRulesEngine";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

interface ScopeFacts {
  session: SessionEntity;
  thread: ThreadEntity;
  stackFrame: StackFrameEntity;
  scope: DP.Scope;
}

export interface AcceptedScope {
  entity: ScopeEntity;
  variablesArgs?: DP.VariablesArguments;
}

export class ScopeRulesEngine extends BaseRulesEngine {
  async eval(facts: ScopeFacts): Promise<AcceptedScope | null> {
    const result = await this.engine.run(facts);

    // Return null if the scope is rejected
    if (this.isRejected(result)) {
      return null;
    }

    const entity: ScopeEntity = {
      ...facts.scope,
      pedagogId: facts.scope.variablesReference.toString(),
      stackFrameId: facts.stackFrame.id,
    };

    const variablesArgs: DP.VariablesArguments = {
      variablesReference: entity.variablesReference,
    };

    // TODO: process events

    return { entity, variablesArgs };
  }
}