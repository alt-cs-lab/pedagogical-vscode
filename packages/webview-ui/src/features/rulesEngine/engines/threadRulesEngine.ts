import { BaseRulesEngine } from "./baseRulesEngine";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { SessionEntity, ThreadEntity } from "../../sessions/entities";

/** Object passed into the rules engine as facts. */
interface ThreadFacts {
  session: SessionEntity;
  thread: DP.Thread;
}

export interface AcceptedThread {
  entity: ThreadEntity;
  stackTraceArgs?: DP.StackTraceArguments;
}

export class ThreadRulesEngine extends BaseRulesEngine {
  /**
   * Pass a debug thread through the rules engine.
   * @param facts The facts object to pass into the rules engine.
   * @returns The resulting ThreadEntity and StackTraceArguments after processing the rules,
   * or null if the thread was rejected.
   */
  async eval(facts: ThreadFacts): Promise<AcceptedThread | null> {
    const result = await this.engine.run(facts);

    // Return null if the thread is rejected
    if (this.isRejected(result)) {
      return null;
    }

    const entity: ThreadEntity = {
      ...facts.thread,
      stackFrameIds: [],
    };

    const stackTraceArgs: DP.StackTraceArguments = {
      threadId: entity.id,
    };

    // for (const event of result.events) {
    //   // TODO: modify entity and stackTraceArgs based on successful events
    // }

    return { entity, stackTraceArgs };
  }
}