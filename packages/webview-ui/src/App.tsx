import "./App.css";
import { Events } from "./features/events/Events";
import { Scopes } from "./features/scopes/Scopes";
import { Threads } from "./features/threads/Threads";

export default function App() {
  return (
    <main>
      <Scopes />
      <Threads />
      <Events />
    </main>
  );
}
