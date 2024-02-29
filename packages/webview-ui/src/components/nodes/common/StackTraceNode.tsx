import "./CommonNode.css";
import "./StackTraceNode.css";
import { NodeProps } from "reactflow";
import { BaseNodeData } from "../base";

export type StackTraceData = BaseNodeData;

export default function StackTraceNode(_props: NodeProps<StackTraceData>) {
  return (
    <div className="common-node stack-trace-node">
      <div className="stack-trace-header">Stack Trace</div>
    </div>
  );
}
