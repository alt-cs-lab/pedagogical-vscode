import { DebugProtocol } from "@vscode/debugprotocol";

type ScopeProps = {
  scope: DebugProtocol.Scope;
};

export const Scope = (props: ScopeProps) => {
  const scope = props.scope;
  return (
    <div>
      <h4>Scope: {scope.name}</h4>
    </div>
  );
};
