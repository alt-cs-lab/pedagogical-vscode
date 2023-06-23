import { Handle, Position } from "reactflow";

export type VariablesNodeProps = {
  data: {
    variables: {
      name: string;
      type?: string;
      value?: string;
      reference?: number;
    }[];
  };
};

export const VariablesNode = ({ data }: VariablesNodeProps) => {
  const variables = data.variables;
  return (
    <>
      <div
        style={{
          border: "solid black",
          position: "relative",
          backgroundColor: "var(--vscode-panel-background)",
        }}>
        <Handle
          position={Position.Left}
          type="target"
          style={{ left: -9, width: 10, height: 10, backgroundColor: "#512888" }}
        />
        {variables.map((variable) => (
          <div
            key={variable.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 10px",
            }}>
            <pre style={{ margin: "5px 0" }}>{variable.name}:</pre>
            {variable.reference ? (
              <div style={{ position: "relative", marginLeft: 25, left: -3 }}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${variable.reference}`}
                  style={{ backgroundColor: "#512888", width: 10, height: 10 }}
                />
              </div>
            ) : variable.value ? (
              <pre style={{ margin: "5px 0" }}>{variable.value}</pre>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};
