import { buildFlow } from "../../../flow/builders/default";
import { debuggerPaused, setAllSession } from "../../../sessions/sessionsSlice";
import { getStrategies } from "../../strategies";
import { buildAppListener } from "../../listeners";

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
    api.dispatch(setAllSession(sessionId, debugType, payload));
    api.dispatch(buildFlow({ sessionId }));
  }
);
