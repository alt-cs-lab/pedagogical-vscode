import { Node } from "reactflow";
import { VariablesNode, VariablesNodeProps } from "./VariablesNode";

export const nodeTypes = {
  variables: VariablesNode,
};

type NodeFrom<Props extends { data: any }, TypeName extends string> = Node<Props["data"], TypeName>;

export type DebugNode = NodeFrom<VariablesNodeProps, "variables">;
