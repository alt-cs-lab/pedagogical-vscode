import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetScopesQuery } from "../../services/debugAdapterApi";
import { Scope } from "../scopes/Scope";

type StackFrameProps = {
  frame: DebugProtocol.StackFrame;
};

export const StackFrame = (props: StackFrameProps) => {
  const frame = props.frame;
  const { data, error, isLoading } = useGetScopesQuery({ frameId: frame.id });

  return (
    <>
      <h3>Stack Frame: {frame.name}</h3>
      <div style={{ paddingLeft: 8 }}>
        {error
          ? "There was an error getting the scopes!"
          : isLoading
          ? "Loading scopes..."
          : data
          ? data.scopes?.map((scope) => <Scope key={scope.name} scope={scope} />)
          : null}
      </div>
    </>
  );
};
