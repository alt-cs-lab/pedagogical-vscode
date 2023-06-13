import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { clearMessages } from "./messagesSlice";
import { Message } from "./Message";

export const Messages = () => {
  const state = useAppSelector((state) => state.messages);
  const dispatch = useAppDispatch();

  return (
    <>
      <h1>Debug Messages</h1>
      <VSCodeButton onClick={() => dispatch(clearMessages())} appearance="secondary">
        Clear Messages
      </VSCodeButton>
      <div>
        {state.messages.map((msg) => (
          <Message key={msg.id} message={msg.message} />
        ))}
      </div>
    </>
  );
};
