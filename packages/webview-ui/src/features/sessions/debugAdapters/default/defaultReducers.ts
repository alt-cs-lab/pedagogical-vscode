import { Session } from "../../sessionsSlice";
import {
  fetchScopes,
  fetchSessionState,
  fetchStackTrace,
  fetchThreads,
  fetchVariables,
} from "../thunks";
import {
  threadsAdapter,
  stackFramesAdapter,
  scopesAdapter,
  variablesAdapter,
  ThreadEntity,
  StackFrameEntity,
  ScopeEntity,
  VariablesEntity,
} from "../entities";
import { SessionReducerMapBuilder } from "../reducers";

function defaultSetSessionState(
  session: Session,
  payload: {
    threads: ThreadEntity[];
    stackFrames: StackFrameEntity[];
    scopes: ScopeEntity[];
    variables: VariablesEntity[];
  }
) {
  threadsAdapter.setAll(session.threads, payload.threads);
  stackFramesAdapter.setAll(session.stackFrames, payload.stackFrames);
  scopesAdapter.setAll(session.scopes, payload.scopes);
  variablesAdapter.setAll(session.variables, payload.variables);
}

export const defaultReducerMapBuilder: SessionReducerMapBuilder = (builder) => {
  builder.addMatcher(fetchSessionState.fulfilled.match, (state, action) => {
    const session = state[action.meta.arg.sessionId];
    defaultSetSessionState(session, action.payload);
  });

  builder.addMatcher(fetchThreads.fulfilled.match, (state, action) => {
    const session = state[action.meta.arg.sessionId];
    threadsAdapter.upsertMany(session.threads, action.payload.threads);
  });

  builder.addMatcher(fetchStackTrace.fulfilled.match, (state, action) => {
    const session = state[action.meta.arg.sessionId];
    stackFramesAdapter.upsertMany(session.stackFrames, action.payload.stackFrames);

    const newFrameIds = action.payload.stackFrames.map((frame) => frame.id);
    const thread = session.threads.entities[action.meta.arg.threadId];
    thread?.stackFrameIds.push(...newFrameIds);
  });

  builder.addMatcher(fetchScopes.fulfilled.match, (state, action) => {
    const session = state[action.meta.arg.sessionId];
    scopesAdapter.upsertMany(session.scopes, action.payload.scopes);

    const frameId = action.meta.arg.frameId;
    const frame = session.stackFrames.entities[frameId];
    const newScopeIds = action.payload.scopes.map((scope) => scope.pedagogId);
    frame?.scopeIds.push(...newScopeIds);
  });

  builder.addMatcher(fetchVariables.fulfilled.match, (state, action) => {
    const session = state[action.meta.arg.sessionId];
    variablesAdapter.upsertOne(session.variables, action.payload);
  });
};
