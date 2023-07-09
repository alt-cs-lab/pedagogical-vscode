import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { Handle, Position } from "reactflow";

import "./VariablesList.css";

export const VariablesList = (props: { variables: DP.Variable[] }) => {
  return (
    <ul className="variables-list">
      {props.variables.map((variable) => (
        <li className="variables-item" key={variable.name}>
          <pre style={{ margin: "5px 0" }}>{variable.name}:</pre>
          {variable.variablesReference ? (
            <div style={{ position: "relative", marginLeft: 25, left: -3 }}>
              <Handle
                type="source"
                position={Position.Right}
                id={variable.name}
                style={{ backgroundColor: "#512888", width: 10, height: 10 }}
              />
            </div>
          ) : variable.value ? (
            <pre style={{ margin: "5px 0" }}>{variable.value}</pre>
          ) : null}
        </li>
      ))}
    </ul>
  );
};