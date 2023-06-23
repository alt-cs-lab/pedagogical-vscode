import { DebugNodeType, nodeTypes } from "./types";

type DebugNodeProps = DebugNodeType;

export const DebugNode = (props: DebugNodeProps) => {
  if (props.type === undefined) {
    return null;
  }
  const NodeComponent = nodeTypes[props.type];
  return <NodeComponent {...(props as any)} />;
};
