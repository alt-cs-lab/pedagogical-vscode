import { Node } from "reactflow";
import { commonNodeTypes } from "./common";
import { BaseNodeData } from "./base";

export const nodeTypes = {
  ...commonNodeTypes,
};

export type NodeTypes = keyof typeof nodeTypes;

type NodeFrom<
  Type extends NodeTypes = NodeTypes,
  NodeData extends BaseNodeData = Parameters<(typeof nodeTypes)[Type]>[0]["data"],
> = Node<NodeData, Type>;

export type PedagogNode<T extends NodeTypes = NodeTypes> = NodeFrom<T>;

/** container used for stories */
export const DebugNodeContainer = (props: PedagogNode) => {
  if (props.type === undefined) {
    return null;
  }
  const NodeComponent = nodeTypes[props.type];
  return <NodeComponent {...(props as any)} />;
};
