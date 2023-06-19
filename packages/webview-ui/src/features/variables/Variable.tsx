import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetVariablesQuery } from "../../services/debugAdapterApi";

type VariableProps = {
  variable: DebugProtocol.Variable;
};

export const Variable = (props: VariableProps) => {
  const variable = props.variable;

  if (variable.type === "") {
    return null;
  }

  if (variable.variablesReference > 0) {
    useGetVariablesQuery({ variablesReference: variable.variablesReference });
  }

  return (
    <div>
      Variable: {variable.name} = {variable.value}
    </div>
  );
};
