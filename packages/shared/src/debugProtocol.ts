/**
 * The official debug adapter protocol types don't have the literal string enums like the json schema does.
 * This fixes those types so the command or event string is constant and associated with its respective type.
 * That way it's easier for things like types or switching based on command type with autocomplete.
 *
 * For example, if you want to make a variables debug request, you can start typing:
 *
 * `const req: DebugRequest = { command: "variables", args: {...} };`
 *
 * and typescript will know that `args` is of type `DP.VariablesArguments`.
 *
 * Or you can more easily switch based on a request command type:
 *
 * ```
 * switch (debugRequest.command) {
 *   case "cancel":
 *     // debugRequest.args is DP.CancelArguments | undefined
 *     break;
 *   case "runInTerminal":
 *     // debugRequest.args is DP.RunInTerminalRequestArguments
 *     break;
 *   ...
 * }
 * ```
 */
import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type DebugRequestType<Command extends string, Arguments> = {
  command: Command;
  args: Arguments;
};

/** The command and args for a request sent to the debug adapter. */
export type DebugRequest =
  | DebugRequestType<"cancel", DP.CancelArguments | undefined>
  | DebugRequestType<"runInTerminal", DP.RunInTerminalRequestArguments>
  | DebugRequestType<"startDebugging", DP.StartDebuggingRequestArguments>
  | DebugRequestType<"initialize", DP.InitializeRequestArguments>
  | DebugRequestType<"configurationDone", DP.ConfigurationDoneArguments | undefined>
  | DebugRequestType<"launch", DP.LaunchRequestArguments>
  | DebugRequestType<"attach", DP.AttachRequestArguments>
  | DebugRequestType<"restart", DP.RestartArguments | undefined>
  | DebugRequestType<"disconnect", DP.DisconnectArguments | undefined>
  | DebugRequestType<"terminate", DP.TerminateArguments | undefined>
  | DebugRequestType<"breakpointLocations", DP.BreakpointLocationsArguments | undefined>
  | DebugRequestType<"setBreakpoints", DP.SetBreakpointsArguments>
  | DebugRequestType<"setFunctionBreakpoints", DP.SetFunctionBreakpointsArguments>
  | DebugRequestType<"setExceptionBreakpoints", DP.SetExceptionBreakpointsArguments>
  | DebugRequestType<"dataBreakpointInfo", DP.DataBreakpointInfoArguments>
  | DebugRequestType<"setDataBreakpoints", DP.SetDataBreakpointsArguments>
  | DebugRequestType<"setInstructionBreakpoints", DP.SetInstructionBreakpointsArguments>
  | DebugRequestType<"continue", DP.ContinueArguments>
  | DebugRequestType<"next", DP.NextArguments>
  | DebugRequestType<"stepIn", DP.StepInArguments>
  | DebugRequestType<"stepOut", DP.StepOutArguments>
  | DebugRequestType<"stepBack", DP.StepBackArguments>
  | DebugRequestType<"reverseContinue", DP.ReverseContinueArguments>
  | DebugRequestType<"restartFrame", DP.RestartFrameArguments>
  | DebugRequestType<"goto", DP.GotoArguments>
  | DebugRequestType<"pause", DP.PauseArguments>
  | DebugRequestType<"stackTrace", DP.StackTraceArguments>
  | DebugRequestType<"scopes", DP.ScopesArguments>
  | DebugRequestType<"variables", DP.VariablesArguments>
  | DebugRequestType<"setVariable", DP.SetVariableArguments>
  | DebugRequestType<"source", DP.SourceArguments>
  | DebugRequestType<"threads", undefined>
  | DebugRequestType<"terminateThreads", DP.TerminateThreadsArguments>
  | DebugRequestType<"modules", DP.ModulesArguments>
  | DebugRequestType<"loadedSources", DP.LoadedSourcesArguments | undefined>
  | DebugRequestType<"evaluate", DP.EvaluateArguments>
  | DebugRequestType<"setExpression", DP.SetExpressionArguments>
  | DebugRequestType<"stepInTargets", DP.StepInTargetsArguments>
  | DebugRequestType<"gotoTargets", DP.GotoTargetsArguments>
  | DebugRequestType<"completions", DP.CompletionsArguments>
  | DebugRequestType<"exceptionInfo", DP.ExceptionInfoArguments>
  | DebugRequestType<"readMemory", DP.ReadMemoryArguments>
  | DebugRequestType<"writeMemory", DP.WriteMemoryArguments>
  | DebugRequestType<"disassemble", DP.DisassembleArguments>;

export type DebugRequestCommand = DebugRequest["command"];

export type DebugResponseType<
  Command extends DebugRequest["command"],
  Response extends DP.Response
> = Response["body"] & {
  command: Command;
};

/** A message from the debug adapter responding to a request */
export type DebugResponse =
  | DebugResponseType<"cancel", DP.CancelResponse>
  | DebugResponseType<"runInTerminal", DP.RunInTerminalResponse>
  | DebugResponseType<"startDebugging", DP.StartDebuggingResponse>
  | DebugResponseType<"initialize", DP.InitializeResponse>
  | DebugResponseType<"configurationDone", DP.ConfigurationDoneResponse>
  | DebugResponseType<"launch", DP.LaunchResponse>
  | DebugResponseType<"attach", DP.AttachResponse>
  | DebugResponseType<"restart", DP.RestartResponse>
  | DebugResponseType<"disconnect", DP.DisconnectResponse>
  | DebugResponseType<"terminate", DP.TerminateResponse>
  | DebugResponseType<"breakpointLocations", DP.BreakpointLocationsResponse>
  | DebugResponseType<"setBreakpoints", DP.SetBreakpointsResponse>
  | DebugResponseType<"setFunctionBreakpoints", DP.SetFunctionBreakpointsResponse>
  | DebugResponseType<"setExceptionBreakpoints", DP.SetExceptionBreakpointsResponse>
  | DebugResponseType<"dataBreakpointInfo", DP.DataBreakpointInfoResponse>
  | DebugResponseType<"setDataBreakpoints", DP.SetDataBreakpointsResponse>
  | DebugResponseType<"setInstructionBreakpoints", DP.SetInstructionBreakpointsResponse>
  | DebugResponseType<"continue", DP.ContinueResponse>
  | DebugResponseType<"next", DP.NextResponse>
  | DebugResponseType<"stepIn", DP.StepInResponse>
  | DebugResponseType<"stepOut", DP.StepOutResponse>
  | DebugResponseType<"stepBack", DP.StepBackResponse>
  | DebugResponseType<"reverseContinue", DP.ReverseContinueResponse>
  | DebugResponseType<"restartFrame", DP.RestartFrameResponse>
  | DebugResponseType<"goto", DP.GotoResponse>
  | DebugResponseType<"pause", DP.PauseResponse>
  | DebugResponseType<"stackTrace", DP.StackTraceResponse>
  | DebugResponseType<"scopes", DP.ScopesResponse>
  | DebugResponseType<"variables", DP.VariablesResponse>
  | DebugResponseType<"setVariable", DP.SetVariableResponse>
  | DebugResponseType<"source", DP.SourceResponse>
  | DebugResponseType<"threads", DP.ThreadsResponse>
  | DebugResponseType<"terminateThreads", DP.TerminateThreadsResponse>
  | DebugResponseType<"modules", DP.ModulesResponse>
  | DebugResponseType<"loadedSources", DP.LoadedSourcesResponse>
  | DebugResponseType<"evaluate", DP.EvaluateResponse>
  | DebugResponseType<"setExpression", DP.SetExpressionResponse>
  | DebugResponseType<"stepInTargets", DP.StepInTargetsResponse>
  | DebugResponseType<"gotoTargets", DP.GotoTargetsResponse>
  | DebugResponseType<"completions", DP.CompletionsResponse>
  | DebugResponseType<"exceptionInfo", DP.ExceptionInfoResponse>
  | DebugResponseType<"readMemory", DP.ReadMemoryResponse>
  | DebugResponseType<"writeMemory", DP.WriteMemoryResponse>
  | DebugResponseType<"disassemble", DP.DisassembleResponse>;

export type DebugEventType<EventString extends string, EventType extends DP.Event> = {
  event: EventString;
  body: EventType["body"];
};

/** An event emitted by the debug adapter */
export type DebugEvent =
  | DebugEventType<"initialized", DP.InitializedEvent>
  | DebugEventType<"stopped", DP.StoppedEvent>
  | DebugEventType<"continued", DP.ContinuedEvent>
  | DebugEventType<"exited", DP.ExitedEvent>
  | DebugEventType<"terminated", DP.TerminatedEvent>
  | DebugEventType<"thread", DP.ThreadEvent>
  | DebugEventType<"output", DP.OutputEvent>
  | DebugEventType<"breakpoint", DP.BreakpointEvent>
  | DebugEventType<"module", DP.ModuleEvent>
  | DebugEventType<"loadedSource", DP.LoadedSourceEvent>
  | DebugEventType<"process", DP.ProcessEvent>
  | DebugEventType<"capabilities", DP.CapabilitiesEvent>
  | DebugEventType<"progressStart", DP.ProgressStartEvent>
  | DebugEventType<"progressUpdate", DP.ProgressUpdateEvent>
  | DebugEventType<"progressEnd", DP.ProgressEndEvent>
  | DebugEventType<"invalidated", DP.InvalidatedEvent>
  | DebugEventType<"memory", DP.MemoryEvent>;
