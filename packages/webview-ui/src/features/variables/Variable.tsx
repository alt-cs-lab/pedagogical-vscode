import { DebugProtocol } from "@vscode/debugprotocol";

type VariableProps = {
  variable: DebugProtocol.Variable;
};

export const Variable = (props: VariableProps) => {
  const variable = props.variable;
  return (
    <h5>
      Variable: {variable.name} = {variable.value}
    </h5>
  );
};
