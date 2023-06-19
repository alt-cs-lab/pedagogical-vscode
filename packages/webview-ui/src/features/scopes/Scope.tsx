import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetVariablesQuery } from "../../services/debugAdapterApi";

type ScopeProps = {
  scope: DebugProtocol.Scope;
};

export const Scope = (props: ScopeProps) => {
  const scope = props.scope;
  useGetVariablesQuery({ variablesReference: scope.variablesReference });

  return <></>;
};
