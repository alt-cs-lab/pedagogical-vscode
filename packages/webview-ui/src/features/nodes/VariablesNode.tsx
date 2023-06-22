import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { Handle, Position } from "reactflow";

export type VariablesNodeProps = {
  data: DP.Variable[];
};

export const VariablesNode = (props: VariablesNodeProps) => {
  const variables = props.data;
  return (
    <>
      <div style={{ backgroundColor: "white", background: "lightblue" }}>
        {variables.map((variable) => (
          <div key={variable.name} style={{ position: "relative" }}>
            <pre style={{ padding: "2px" }}>
              {variable.name}: {variable.value}
            </pre>
            {variable.variablesReference > 0 ? (
              <Handle
                type="source"
                position={Position.Right}
                id={variable.variablesReference.toString()}
              />
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};
