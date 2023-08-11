import { NodeProps, Handle, Position } from "reactflow";
import { VariablesList, VariablesListItem } from "./VariablesList";

import "./CommonNode.css";
import "./VariablesNode.css";
import { BaseNodeData } from "../base";

export type VariablesData = BaseNodeData & {
  variablesListItems: VariablesListItem[];
};

export default function VariablesNode(props: NodeProps<VariablesData>) {
  return (
    <div className="common-node variables-node">
      <div className="common-node-header">{props.data.name}</div>
      <Handle
        className="variables-node-handle"
        position={Position.Left}
        type="target"
      />
      <hr />
      <VariablesList items={props.data.variablesListItems} />
    </div>
  );
}
