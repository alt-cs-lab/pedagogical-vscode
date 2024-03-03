import "./CommonNode.css";
import "./VariablesNode.css";
import { NodeProps, Handle, Position } from "reactflow";
import { VariablesList, VariablesListItem } from "./VariablesList";
import { BaseNodeData } from "../base";
import { useRef } from "react";
import { useMeasureNode } from "../hooks";

export type VariablesData = BaseNodeData & {
  items: VariablesListItem[];
};

export default function VariablesNode(props: NodeProps<VariablesData>) {
  const divRef = useRef<HTMLDivElement | null>(null);
  useMeasureNode(divRef, props.data.measuredSize);

  return (
    <div ref={divRef} className="common-node variables-node">
      <div className="common-node-header">{props.data.name}</div>
      <Handle className="variables-node-handle" position={Position.Left} type="target" />
      <VariablesList nodeId={props.id} items={props.data.items} />
    </div>
  );
}
