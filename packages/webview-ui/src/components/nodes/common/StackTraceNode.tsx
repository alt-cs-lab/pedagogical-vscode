import "./CommonNode.css";
import "./StackTraceNode.css";
import { NodeProps } from "reactflow";
import { BaseNodeData } from "../base";
import { useRef } from "react";
import { useMeasureNode } from "../hooks";

export type StackTraceData = BaseNodeData;

export default function StackTraceNode(props: NodeProps<StackTraceData>) {
  const divRef = useRef<HTMLDivElement | null>(null);
  useMeasureNode(divRef, props.data.measuredSize);

  return (
    <div ref={divRef} className="common-node stack-trace-node">
      <div className="stack-trace-header">Stack Trace</div>
    </div>
  );
}
