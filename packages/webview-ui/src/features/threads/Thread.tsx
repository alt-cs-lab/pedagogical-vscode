import { DebugProtocol } from "@vscode/debugprotocol";

type ThreadProps = DebugProtocol.Thread;

export const Thread = (props: ThreadProps) => {
  return (
    <>
      <div>Name: {props.name}</div>
      <div>Id: {props.id}</div>
    </>
  );
};
