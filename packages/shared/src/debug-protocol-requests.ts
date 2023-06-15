import { DebugProtocol as DP } from "@vscode/debugprotocol";

/**
 * Send a request to the debug adapter.
 * See {@link https://microsoft.github.io/debug-adapter-protocol/specification} for more info.
 * @param command The request command as a string ("variables", "stackTrace", etc.)
 * @param args The arguments object associated with that command
 * @returns  The response object associated with that command
 */
export async function sendDebugRequest<C extends keyof DebugRequestTypes>(
  command: C,
  args?: DebugRequestArguments<C>
): Promise<DebugResponse<C>> {
  throw new Error("TODO: not yet implemented");
}

export type DebugRequest<C extends keyof DebugRequestTypes> = {
  command: C;
  args?: DebugRequestArguments<C>;
};
export type DebugRequestArguments<C extends keyof DebugRequestTypes> = DebugRequestTypes[C][0];
export type DebugResponse<C extends keyof DebugRequestTypes> = DebugRequestTypes[C][1];

/**
 * A collection of the auto-generated debug protocol types,
 * organized in a way that makes it easy for us to make requests.
 *
 * Each key is the command string passed to the debug adapter.
 * Each value is a tuple containing the respective Arguments and Response types for the command.
 */
// tip: try the multi-select tool (middle-click + drag) if you need to edit a bunch of stuff
// prettier-ignore
type DebugRequestTypes = {
  cancel: [DP.CancelArguments, DP.CancelResponse];
  runInTerminal: [DP.RunInTerminalRequestArguments, DP.RunInTerminalResponse];
  startDebugging: [DP.StartDebuggingRequestArguments, DP.StartDebuggingResponse];
  initialize: [DP.InitializeRequestArguments, DP.InitializeResponse];
  configurationDone: [DP.ConfigurationDoneArguments, DP.ConfigurationDoneResponse];
  launch: [DP.LaunchRequestArguments, DP.LaunchResponse];
  attach: [DP.AttachRequestArguments, DP.AttachResponse];
  restart: [DP.RestartArguments, DP.RestartResponse];
  disconnect: [DP.DisconnectArguments, DP.DisconnectResponse];
  terminate: [DP.TerminateArguments, DP.TerminateResponse];
  breakpointLocations: [DP.BreakpointLocationsArguments, DP.BreakpointLocationsResponse];
  setBreakpoints: [DP.SetBreakpointsArguments, DP.SetBreakpointsResponse];
  setFunctionBreakpoints: [DP.SetFunctionBreakpointsArguments, DP.SetFunctionBreakpointsResponse];
  setExceptionBreakpoints: [DP.SetExceptionBreakpointsArguments, DP.SetExceptionBreakpointsResponse];
  dataBreakpointInfo: [DP.DataBreakpointInfoArguments, DP.DataBreakpointInfoResponse];
  setDataBreakpoints: [DP.SetDataBreakpointsArguments, DP.SetDataBreakpointsResponse];
  setInstructionBreakpoints: [DP.SetInstructionBreakpointsArguments, DP.SetInstructionBreakpointsResponse];
  continue: [DP.ContinueArguments, DP.ContinueResponse];
  next: [DP.NextArguments, DP.NextResponse];
  stepIn: [DP.StepInArguments, DP.StepInResponse];
  stepOut: [DP.StepOutArguments, DP.StepOutResponse];
  stepBack: [DP.StepBackArguments, DP.StepBackResponse];
  reverseContinue: [DP.ReverseContinueArguments, DP.ReverseContinueResponse];
  restartFrame: [DP.RestartFrameArguments, DP.RestartFrameResponse];
  goto: [DP.GotoArguments, DP.GotoResponse];
  pause: [DP.PauseArguments, DP.PauseResponse];
  stackTrace: [DP.StackTraceArguments, DP.StackTraceResponse];
  scopes: [DP.ScopesArguments, DP.ScopesResponse];
  variables: [DP.VariablesArguments, DP.VariablesResponse];
  setVariable: [DP.SetVariableArguments, DP.SetVariableResponse];
  source: [DP.SourceArguments, DP.SourceResponse];
  threads: [undefined, DP.ThreadsResponse];
  terminateThreads: [DP.TerminateThreadsArguments, DP.TerminateThreadsResponse];
  modules: [DP.ModulesArguments, DP.ModulesResponse];
  loadedSources: [DP.LoadedSourcesArguments, DP.LoadedSourcesResponse];
  evaluate: [DP.EvaluateArguments, DP.EvaluateResponse];
  setExpression: [DP.SetExpressionArguments, DP.SetExpressionResponse];
  stepInTargets: [DP.StepInTargetsArguments, DP.StepInTargetsResponse];
  gotoTargets: [DP.GotoTargetsArguments, DP.GotoTargetsResponse];
  completions: [DP.CompletionsArguments, DP.CompletionsResponse];
  exceptionInfo: [DP.ExceptionInfoArguments, DP.ExceptionInfoResponse];
  readMemory: [DP.ReadMemoryArguments, DP.ReadMemoryResponse];
  writeMemory: [DP.WriteMemoryArguments, DP.WriteMemoryResponse];
  disassemble: [DP.DisassembleArguments, DP.DisassembleResponse];
}
