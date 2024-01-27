import {
  ScopeEntity,
  SessionEntity,
  StackFrameEntity,
  ThreadEntity,
} from "../../sessions/entities";
import { ScopeRulesEngine } from "./scopeRulesEngine";
import { StackFrameRulesEngine } from "./stackFrameRulesEngine";
import { ThreadRulesEngine } from "./threadRulesEngine";
import { VariablesRulesEngine } from "./variablesRulesEngine";
import { defaultRules, rulesPerDebugType } from "../rules";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { MessageBox } from "../../../util";

window.localStorage.debug = "json-rules-engine";

export class SessionRulesEngine {
  private session: SessionEntity;
  private threadEngine: ThreadRulesEngine;
  private stackFrameEngine: StackFrameRulesEngine;
  private scopeEngine: ScopeRulesEngine;
  private variableEngine: VariablesRulesEngine;

  constructor(session: SessionEntity) {
    this.session = session;

    let rules = rulesPerDebugType[session.type];
    if (rules === undefined) {
      rules = defaultRules;
      // Display a message that the current debugger may not be supported.
      MessageBox.showInformation(
        `No rules were defined for the \`${session.type}\` debugger. The information shown may be inaccurate.`
      );
    }

    this.threadEngine = new ThreadRulesEngine(rules.threadRules);
    this.stackFrameEngine = new StackFrameRulesEngine(rules.stackFrameRules);
    this.scopeEngine = new ScopeRulesEngine(rules.scopeRules);
    this.variableEngine = new VariablesRulesEngine(rules.variableRules);
  }

  /**
   * Evaluate a thread through the rules engine.
   * @param thread The thread returned by the debug adapter.
   * @returns The ThreadEntity and StackTraceArguments resulting from the rules, or null if the thread is rejected.
   */
  async evalThread(thread: DP.Thread) {
    try {
      return await this.threadEngine.eval({ session: this.session, thread });
    } catch (e) {
      console.error(e);
      console.log(e);
      MessageBox.showInformation(
        "An error occured while processing a rule, and a thread was dropped."
      );
      return null;
    }
  }

  /**
   * Evaluate a stack frame through the rules engine.
   * @param thread The parent ThreadEntity of this stack frame.
   * @param stackFrame The StackFrame returned by the debug adapter.
   * @returns The StackFrameEntity and ScopeArguments resulting from the rules, or null if the stack frame is rejected.
   */
  async evalStackFrame(thread: ThreadEntity, stackFrame: DP.StackFrame) {
    try {
      return await this.stackFrameEngine.eval({
        session: this.session,
        thread,
        stackFrame,
      });
    } catch (e) {
      console.error(e);
      console.log(e);
      MessageBox.showInformation(
        "An error occured while processing a rule, and a stack frame was dropped."
      );
      return null;
    }
  }

  /**
   * Evaluate a scope through the rules engine.
   * @param thread The parent ThreadEntity of the stack frame.
   * @param stackFrame The parent StackFrameEntity of this scope.
   * @param scope The Scope returned by the debug adapter.
   * @returns The ScopeEntity and VariablesArguments resulting from the rules, or null if the scope is rejected.
   */
  async evalScope(
    thread: ThreadEntity,
    stackFrame: StackFrameEntity,
    scope: DP.Scope
  ) {
    try {
      return await this.scopeEngine.eval({
        session: this.session,
        thread,
        stackFrame,
        scope,
      });
    } catch (e) {
      console.error(e);
      console.log(e);
      MessageBox.showInformation(
        "An error occured while processing a rule, and a scope was dropped."
      );
      return null;
    }
  }

  /**
   * Evaluate a variable through the rules engine.
   * @param thread The parent ThreadEntity of the stack frame.
   * @param stackFrame The parent StackFrameEntity of the scope.
   * @param scope The parent or ancestor ScopeEntity of this variable.
   * @param parentVariable The parent variable of this variable, or undefined if this is a top-level variable in a scope.
   * @param variable The variable returned by the debug adapter.
   * @param depth The variable recursion depth. By default, child variables will not be fetched after a depth of 10.
   * @returns The resulting Variable along with a VariableArguments and pedagogId if fetching children,
   * or null if the variable is rejected.
   */
  async evalVariable(
    thread: ThreadEntity,
    stackFrame: StackFrameEntity,
    scope: ScopeEntity,
    parentVariable: DP.Variable | undefined,
    variable: DP.Variable,
    depth: number
  ) {
    try {
      return await this.variableEngine.eval({
        session: this.session,
        thread,
        stackFrame,
        scope,
        parentVariable,
        variable,
        meta: { depth },
      });
    } catch (e) {
      console.error(e);
      console.log(e);
      MessageBox.showInformation(
        "An error occured while processing a rule, and a variable was dropped."
      );
      return null;
    }
  }
}
