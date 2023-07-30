import { Node } from "reactflow";
import { commonNodeTypes } from "./common";

export const nodeTypes = {
  ...commonNodeTypes
};

type NodeFrom<TypeName extends keyof typeof nodeTypes> = Node<
  Parameters<(typeof nodeTypes)[TypeName]>[0]["data"],
  TypeName
>;

export type PedagogNode = NodeFrom<keyof typeof nodeTypes>;

/** container used for stories */
export const DebugNodeContainer = (props: PedagogNode) => {
  if (props.type === undefined) {
    return null;
  }
  const NodeComponent = nodeTypes[props.type];
  return <NodeComponent {...(props as any)} />;
};
