import { DebugTypeStrategies } from "../strategies";

export const defaultStrategies: DebugTypeStrategies = {
  /** Allow all threads */
  filterThreads: (_thread) => true,

  /** Ignore "subtle" and "label" stack frames */
  filterStackFrames: (frame) =>
    frame.presentationHint !== "label" && frame.presentationHint !== "subtle",
  
  /** Ignore scopes that don't begin with "Local" */
  filterScopes: (scope) => scope.name.startsWith("Local"),

  /** Allow all variables */
  filterVariables: (_variables) => true,

  /** Convert DP.Thread to ThreadEntity */
  toThreadEntity: (thread) => ({
    ...thread,
    stackFrameIds: [],
  }),

  /** Convert DP.StackFrame to StackFrameEntity with a threadId */
  toStackFrameEntity: (frame, threadId) => ({
    ...frame,
    threadId,
    scopeIds: [],
  }),

  /** Convert DP.Scope to ScopeEntity with the id `${stackFrameId}-${scope.name}` */
  toScopeEntity: (scope, stackFrameId) => ({
    pedagogId: `${stackFrameId}-${scope.name}`,
    stackFrameId,
    ...scope,
  }),

  /**
   * Convert DP.VariablesArguments and DP.Variable[] to VariablesEntity.
   * 
   * By default the pedagogId is the variablesReference. This changes each time
   * the debugger is paused, so you'll want to use something else.
   * 
   * TODO: allow more parameters (parent scope/variable?)
   */
  toVariablesEntity: (args, variables) => ({
    pedagogId: args.variablesReference.toString(),
    variables,
    ...args,
  }),
};
