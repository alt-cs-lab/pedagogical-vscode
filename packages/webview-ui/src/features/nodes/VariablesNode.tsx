import { DebugProtocol as DP } from "@vscode/debugprotocol";

export type VariablesNodeProps = {
  data: DP.Variable[];
};

export const VariablesNode = (props: VariablesNodeProps) => {
  const variables = props.data;
  return (
    <>
      <div style={{ backgroundColor: "white" }}>
        {variables.map((variable) => (
          <pre key={variable.name} style={{ border: "2 solid blue", padding: "3px" }}>
            {variable.name}: {variable.value}
          </pre>
        ))}
      </div>
    </>
  );
};
