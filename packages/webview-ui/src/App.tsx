import { useAppSelector } from "./hooks";

import "./App.css";
import "reactflow/dist/style.css";
import { getSessionComponent } from "./features/sessions/sessionsSlice";

export default function App() {
  const currentSessionId = useAppSelector(
    (state) => state.sessions.currentSessionId
  );

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
