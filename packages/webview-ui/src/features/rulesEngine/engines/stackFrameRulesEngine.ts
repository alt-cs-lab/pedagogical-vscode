import {
  SessionEntity,
  StackFrameEntity,
  ThreadEntity,
} from "../../sessions/entities";
import { BaseRulesEngine } from "./baseRulesEngine";
import { DebugProtocol as DP } from "@vscode/debugprotocol";

interface StackFrameFacts {
  session: SessionEntity;
  thread: ThreadEntity;
  stackFrame: DP.StackFrame;
}

export interface AcceptedStackFrame {
  entity: StackFrameEntity;
  scopesArgs?: DP.ScopesArguments;
}

export class StackFrameRulesEngine extends BaseRulesEngine {
  /**
   * Pass a debug stack frame through the rules engine.
   * @param facts The facts to pass to the engine, including the stack frame object.
   * @returns The resulting StackFrameEntity and ScopesArguments,
   * or null if the frame was rejected.
   */
  async eval(facts: StackFrameFacts): Promise<AcceptedStackFrame | null> {
    const result = await this.engine.run(facts);

    // Return null if this frame is rejected
    if (this.isRejected(result)) {
      return null;
    }

    const entity: StackFrameEntity = {
      ...facts.stackFrame,
      pedagogId: facts.stackFrame.id.toString(),
      threadId: facts.thread.id,
      scopeIds: [],
    };

    const scopesArgs: DP.ScopesArguments = {
      frameId: entity.id,
    };

    // for (const event of events as RuleEvent[]) {
    //   // TODO
    //   // switch (event.type) {
    //   //   case "setPedagogId": {
    //   //     const value = await almanac.factValue(
    //   //       event.params.fact,
    //   //       event.params.params,
    //   //       event.params.path
    //   //     );

    //   //     if (event.params.regexp) {
    //   //       const regexp = RegExp(event.params.regexp.pattern, event.params.regexp.flags);
    //   //       const match = String(value).match(regexp);

    //   //     }
    //   //   }
    //   // }
    // }

    return { entity, scopesArgs };
  }
}
