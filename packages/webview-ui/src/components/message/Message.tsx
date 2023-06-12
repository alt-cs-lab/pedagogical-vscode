import { DebugProtocol } from "@vscode/debugprotocol";
import { useState } from "react";

type MessageProps = {
  message: DebugProtocol.ProtocolMessage;
};

export const Message = (props: MessageProps) => {
  const [expanded, setExpanded] = useState(false);

  let background = "";
  switch (props.message.type) {
    case "event":
      background = "darkgreen";
      break;
    case "request":
      background = "darkred";
      break;
    case "response":
      background = "darkblue";
      break;
  }

  function onClick() {
    setExpanded(!expanded);
  }

  return (
    <div onClick={onClick} style={{ backgroundColor: background, fillOpacity: 70 }}>
      <pre style={{ whiteSpace: expanded ? "pre" : "nowrap" }}>
        {JSON.stringify(props.message, undefined, 2)}
      </pre>
    </div>
  );
};
