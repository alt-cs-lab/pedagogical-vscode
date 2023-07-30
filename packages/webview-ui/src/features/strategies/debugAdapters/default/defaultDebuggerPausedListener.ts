import { buildFlow, debuggerPaused, setAllDebugObjects } from "../../../sessions/sessionsSlice";
import { getStrategies } from "../../strategies";
import { buildAppListener } from "../../listeners";

/**
 * Listener that runs with `debuggerPaused` is dispatched.
 *
 * This fetches objects from the debug adapter based on the strategies defined for the debug type.
 * After that, it sets the objects in the session state and dispatches `buildFlow` to build the flow objects.
 */
export const defaultDebuggerPausedListener = buildAppListener(
  debuggerPaused.match,
  async (action, api) => {
    const sessionId = action.meta.sessionId;
    const debugType = action.meta.debugType;

    const { fetchThreads, fetchStackTraces, fetchScopes, fetchVariables } =
      getStrategies(debugType);

    // TODO: handle rejects
    const threads = await fetchThreads(api, sessionId);
    const stackFrames = await fetchStackTraces(api, sessionId, threads);
    const scopes = await fetchScopes(api, sessionId, stackFrames);
    const variables = await fetchVariables(api, sessionId, scopes);

    // done fetching everything, now we can set the session state and dispatch buildFlow
    const payload = { threads, stackFrames, scopes, variables };
    api.dispatch(setAllDebugObjects(sessionId, debugType, payload));
    api.dispatch(buildFlow(sessionId, debugType));
  }
);
