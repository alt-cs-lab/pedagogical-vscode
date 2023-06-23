import { Node } from "reactflow";
import { VariablesNode } from "./VariablesNode";
import { StackFrameNode } from "./StackFrameNode";

export type DebugNodeType = NodeFrom<"variables"> | NodeFrom<"stackFrame">;

export const nodeTypes = {
  variables: VariablesNode,
  stackFrame: StackFrameNode,
};

type NodeFrom<TypeName extends keyof typeof nodeTypes> = Node<
  Parameters<(typeof nodeTypes)[TypeName]>[0]["data"],
  TypeName
>;
