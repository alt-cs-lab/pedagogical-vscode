import { NodeProps, Handle, Position } from "reactflow";
import { VariablesList, VariablesListItem } from "./VariablesList";

import "./CommonNode.css";
import "./VariablesNode.css";

export type VariablesData = {
  type?: string;
  variablesListItems: VariablesListItem[];
};

export default function VariablesNode(props: NodeProps<VariablesData>) {
  return (
    <div className="common-node">
      <div className="common-node-header">{props.data.type}</div>
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
