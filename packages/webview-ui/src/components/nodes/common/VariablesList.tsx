import { Handle, Position } from "reactflow";

import "./VariablesList.css";

export type VariablesListItem = {
  name: string;
  value: string;
  showHandle: boolean;
};

type VariablesListProps = {
  items: VariablesListItem[];
};

export const VariablesList = (props: VariablesListProps) => {
  return (
    <ul className="variables-list">
      {props.items.map((item) => (
        <li className="variables-item" key={item.name}>
          <div className="variables-item-flex">
            <pre className="variables-item-name">{item.name}:</pre>
            <div className="variables-item-handle-container">
              {item.showHandle ? (
                <Handle
                  className="variables-item-handle"
                  type="source"
                  position={Position.Right}
                  id={item.name}
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
