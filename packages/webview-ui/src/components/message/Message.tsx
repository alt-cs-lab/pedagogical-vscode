import { DebugProtocol } from "@vscode/debugprotocol";

type MessageProps = {
  message: DebugProtocol.ProtocolMessage;
};

export const Message = (props: MessageProps) => {
  return (
    <div>
      <pre>{JSON.stringify(props.message)}</pre>
    </div>
  );
};
