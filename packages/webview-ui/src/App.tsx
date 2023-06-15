import "./App.css";
import { Messages } from "./features/message/Messages";
import { Threads } from "./features/threads/Threads";

export default function App() {
  return (
    <main>
      <Threads />
      <Messages />
    </main>
  );
}
