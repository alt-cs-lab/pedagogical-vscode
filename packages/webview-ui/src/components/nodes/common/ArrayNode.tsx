import { Handle, NodeProps, Position } from "reactflow";
import { BaseNodeData } from "../base";
import { VariablesListItem } from "./VariablesList";

import "./CommonNode.css";
import "./ArrayNode.css";

export type ArrayData = BaseNodeData & {
  items: VariablesListItem[];
};

export default function ArrayNode(props: NodeProps<ArrayData>) {
  return (
    <div className="common-node variables-node">
      <div className="common-node-header">{props.data.name}</div>
      <Handle
        className="variables-node-handle"
        position={Position.Left}
        type="target"
      />
      <div className="array-list">
        {props.data.items.map((item) => (
          <div className="array-cell" key={item.name}>
            <div className="array-item-index">{item.name}:</div>
            {item.showHandle ? (
              <Handle
              className="common-handle"
              type="source"
              position={Position.Bottom}
              id={item.handleId ? item.handleId : item.name}
              />
            ) : item.lazy ? (
              <div className="array-item-value">(lazy)</div>
            ) : (  
              <div className="array-item-value">{item.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}