import "./App.css";
import "reactflow/dist/style.css";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useEffect, useState } from "react";
import { MessageBox } from "./util";
import {
  getSessionComponent,
  setInitialSessionManagerState,
} from "./features/sessions/sessionsSlice";
import { loadRulesThunk } from "./features/rulesEngine/thunks";

export default function App() {
  const dispatch = useAppDispatch();

  const currentSessionId = useAppSelector((state) => state.sessions.currentSessionId);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      await dispatch(loadRulesThunk());
      await setInitialSessionManagerState();
    }
    initialize()
      .then(() => setLoading(false))
      .catch((err) => MessageBox.showError("Error while loading initial state: " + String(err)));
  });

  const SessionComponent = getSessionComponent(currentSessionId);

  return (
    <main>
      {loading ? null : SessionComponent && currentSessionId ? (
        <SessionComponent sessionId={currentSessionId}></SessionComponent>
      ) : (
        <div className="no-sessions-msg">No active debug sessions</div>
      )}
    </main>
  );
}
