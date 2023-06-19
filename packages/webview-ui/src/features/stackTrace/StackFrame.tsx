import { DebugProtocol } from "@vscode/debugprotocol";

type StackFrameProps = DebugProtocol.StackFrame;

export const StackFrame = (props: StackFrameProps) => {
  return (
    <div>
      <div>Name: {props.name}</div>
      <div>Id: {props.id}</div>
    </div>
  );
};
