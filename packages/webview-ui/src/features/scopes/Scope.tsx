import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetVariablesQuery } from "../../services/debugAdapterApi";
import { Variable } from "../variables/Variable";

type ScopeProps = {
  scope: DebugProtocol.Scope;
};

export const Scope = (props: ScopeProps) => {
  const scope = props.scope;
  const { data, error, isLoading } = useGetVariablesQuery({
    variablesReference: scope.variablesReference,
  });

  return (
    <>
      <h4>Scope: {scope.name}</h4>
      <div style={{ paddingLeft: 8 }}>
        {error
          ? "There was an error getting the variables!"
          : isLoading
          ? "Loading variables..."
          : data
          ? data.variables?.map((variable) => <Variable key={variable.name} variable={variable} />)
          : null}
      </div>
    </>
  );
};
