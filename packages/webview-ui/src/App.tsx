import "./App.css";
import { Events } from "./features/events/Events";
import { Threads } from "./features/threads/Threads";

export default function App() {
  return (
    <main>
      <Threads />
      <Events />
    </main>
  );
}
