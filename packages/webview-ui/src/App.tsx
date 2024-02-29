import "./App.css";
import "reactflow/dist/style.css";
import { useAppSelector } from "./hooks";
import {
  getSessionComponent,
  setInitialSessionManagerState,
} from "./features/sessions/sessionsSlice";
import { loadRulesThunk } from "./features/rulesEngine/thunks";
import { store } from "./store";

await store.dispatch(loadRulesThunk());
await setInitialSessionManagerState();

export default function App() {
  const currentSessionId = useAppSelector((state) => state.sessions.currentSessionId);
  const SessionComponent = getSessionComponent(currentSessionId);

  return (
    <main>
      {SessionComponent && currentSessionId ? (
        <SessionComponent sessionId={currentSessionId}></SessionComponent>
      ) : (
        <div className="no-sessions-msg">No active debug sessions</div>
      )}
    </main>
  );
}
