import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import { useEffect } from "react";

import "./VariablesList.css";

export type VariablesListItem = {
  name: string;
  value: string;
  valueColorHint?: "none" | "string" | "number" | "error" | "boolean";
  lazy?: boolean;
  showHandle: boolean;
  handleId?: string;
};

type VariablesListProps = {
  nodeId: string;
  items: VariablesListItem[];
};

export const VariablesList = (props: VariablesListProps) => {
  // if the number of handles changes, then we need to tell react flow to update its internal state
  // otherwise it won't recognize new handles and edges won't be drawn
  // https://reactflow.dev/api-reference/hooks/use-update-node-internals
  const showHandles = props.items.map((i) => i.showHandle).toString();
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => updateNodeInternals(props.nodeId), [showHandles]);

  return (
    <ul className="variables-list">
      {props.items.map((item) => (
        <li className="variables-item" key={item.name}>
          <div className="variables-item-flex">
            <pre className="variables-item-name">{item.name}:</pre>
            {item.lazy ? <div>(lazy)</div> : null}
            <div className="variables-item-handle-container">
              {item.showHandle ? (
                <Handle
                  className="common-handle"
                  type="source"
                  position={Position.Right}
                  id={item.handleId ? item.handleId : item.name}
                />
              ) : (
                <code className="variables-item-value">{item.value}</code>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
