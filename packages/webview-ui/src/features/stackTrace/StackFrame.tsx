import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetScopesQuery } from "../../services/debugAdapterApi";

type StackFrameProps = {
  frame: DebugProtocol.StackFrame;
};

export const StackFrame = (props: StackFrameProps) => {
  const frame = props.frame;
  useGetScopesQuery({ frameId: frame.id });

  return <></>;
};
