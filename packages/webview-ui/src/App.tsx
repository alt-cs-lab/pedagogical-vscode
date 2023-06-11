import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useState } from "react";
import { Message } from "./Message";

interface MessageItem {
  id: number;
  message: string;
}

let nextId = 0;

const App = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner!",
    });
  }

  function handleOnMessage(ev: MessageEvent) {
    setMessages([...messages, { id: nextId++, message: JSON.stringify(ev.data) }]);
  }

  window.onmessage = handleOnMessage;

  return (
    <main>
      <h1>Hello World!</h1>
      <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton>
      <div>
        {messages.map((msg) => (
          <Message key={msg.id} message={msg.message} />
        ))}
      </div>
    </main>
  );
};

export default App;
