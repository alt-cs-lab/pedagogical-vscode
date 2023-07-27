import sessionManager from "./features/sessions/sessionManager";
import { useAppDispatch, useAppSelector } from "./hooks";
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";

import "./App.css";
import "reactflow/dist/style.css";
import { sessionsSelectors } from "./features/sessions/entities";
import { setCurrentSession } from "./features/sessions/sessionsSlice";

export default function App() {
  const dispatch = useAppDispatch();

  // TODO: create a sessin container component so we can pass down sessionId as prop
  const sessions = useAppSelector((state) => sessionsSelectors.selectAll(state.sessionManager.sessions));
  const currentSessionId = useAppSelector((state) => state.sessionManager.currentSessionId);

  const SessionComponent = currentSessionId ? sessionManager.getSessionComponent(currentSessionId) : null;

  function onDropdownChange(event: any) {
    // TODO: fix any
    dispatch(setCurrentSession({ sessionId: event.target.value }));
  }

  return (
    <main>
      <VSCodeDropdown onChange={onDropdownChange}>
        {sessions.map((session) => (
          <VSCodeOption 
            key={session.id}
            value={session.id}
            selected={session.id === currentSessionId}>
            {session.name}
          </VSCodeOption>
        ))}
      </VSCodeDropdown>
      {SessionComponent && currentSessionId ? (
        <SessionComponent sessionId={currentSessionId}></SessionComponent>
      ) : (
        <div className="no-sessions-msg">No active debug sessions</div>
      )}
    </main>
  );
}
