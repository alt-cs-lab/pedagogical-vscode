import { NodeProps, Handle, Position } from "reactflow";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { VariablesList } from "./VariablesList";

export type VariablesData = {
  type?: string;
  variables: DP.Variable[];
};

export const VariablesNode = (props: NodeProps<VariablesData>) => {
  const variables = props.data.variables;
  return (
    <>
      <div
        style={{
          border: "solid black",
          position: "relative",
          backgroundColor: "var(--vscode-panel-background)",
        }}
      >
        <h4>{props.data.type}</h4>
        <Handle
          position={Position.Left}
          type="target"
          style={{ left: -9, width: 10, height: 10, backgroundColor: "#512888" }}
        />
        <VariablesList variables={variables} />
      </div>
    </>
  );
};
