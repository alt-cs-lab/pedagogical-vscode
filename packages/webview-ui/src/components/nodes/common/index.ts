import ArrayNode from "./ArrayNode";
import StackFrameNode from "./StackFrameNode";
import StackTraceNode from "./StackTraceNode";
import VariablesNode from "./VariablesNode";

export const commonNodeTypes = {
  commonVariables: VariablesNode,
  commonStackFrame: StackFrameNode,
  commonStackTrace: StackTraceNode,
  commonArray: ArrayNode,
};
