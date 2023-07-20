import { NodeProps, Handle, Position } from "reactflow";
import { VariablesList, VariablesListItem } from "./VariablesList";

import "./VariablesNode.css";

export type VariablesData = {
  type?: string;
  variablesListItems: VariablesListItem[];
};

export const VariablesNode = (props: NodeProps<VariablesData>) => {
  return (
    <div className="variables-node">
      <div className="variables-node-type">{props.data.type}</div>
      <Handle
        className="variables-node-handle"
        position={Position.Left}
        type="target"
      />
      <VariablesList items={props.data.variablesListItems} />
    </div>
  );
};
