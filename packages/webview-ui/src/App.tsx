import sessionManager from "./features/sessions/sessionManager";
import { useAppSelector } from "./hooks";

import "./App.css";
import "reactflow/dist/style.css";

export default function App() {
  const currentSessionId = useAppSelector(
    (state) => state.sessions.currentSessionId
  );

  const SessionComponent = currentSessionId
    ? sessionManager.getSessionComponent(currentSessionId)
    : null;

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
