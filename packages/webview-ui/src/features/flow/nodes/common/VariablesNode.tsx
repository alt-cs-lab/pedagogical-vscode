import { NodeProps, Handle, Position } from "reactflow";
import { VariablesList } from "./VariablesList";
import { variableSelectors } from "../../../sessions/debugAdapters/entities";
import { useAppSelector } from "../../../../hooks";
import { Session } from "../../../sessions/sessionsSlice";
import { useMemo } from "react";

import "./VariablesNode.css";

export type VariablesData = {
  sessionId: string;
  variableId: string | number;
};

export const VariablesNode = (props: NodeProps<VariablesData>) => {
  const session: Session | undefined = useAppSelector((state) => state.sessions[props.data.sessionId]);
  const variable = useMemo(() => (
    session ? variableSelectors.selectById(session, props.data.variableId) : undefined
  ), [props.data.variableId]);
  if (variable === undefined) {
    return null;
  }

  const variables = variable?.variables;
  return (
    <div className="variables-node">
      {/* <h4>{props.data.type}</h4> */}
      <Handle
        position={Position.Left}
        type="target"
        style={{ left: -9, width: 10, height: 10, backgroundColor: "#512888" }}
      />
      <VariablesList variables={variables} />
    </div>
  );
};
