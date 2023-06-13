import { DebugProtocol } from "@vscode/debugprotocol";

type ScopesRequest = {
  command: "scopes";
  args: DebugProtocol.ScopesArguments;
};

type StackTraceRequest = {
  command: "stackTrace";
  args: DebugProtocol.StackTraceArguments;
};

type VariablesRequest = {
  command: "variables";
  args: DebugProtocol.VariablesArguments;
};

export type DebugRequest = ScopesRequest | StackTraceRequest | VariablesRequest;
