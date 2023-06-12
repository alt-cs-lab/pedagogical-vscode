import "./App.css";
import { Message } from "../message/Message";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useEffect } from "react";
import { vscode } from "../../util/vscode";

export default function App() {
  const state = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  useEffect(() => {
    vscode.setState(state);
  });

  return (
    <main>
      <h1>Debug Messages</h1>
      <div>
        {state.messages.map((msg) => (
          <Message key={msg.id} message={msg.message} />
        ))}
      </div>
    </main>
  );
}
