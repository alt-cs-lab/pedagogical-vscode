import { ThreadEntity, StackFrameEntity, ScopeEntity, VariablesEntity, NodeEntity, EdgeEntity } from "../../entities";
import { createSessionAction } from "../sessionAction";

type SetAllDebugObjectsPayload = {
  threads: ThreadEntity[];
  stackFrames: StackFrameEntity[];
  scopes: ScopeEntity[];
  variables: VariablesEntity[];
};
export const setAllDebugObjects = createSessionAction<SetAllDebugObjectsPayload>(
  "session/setAllDebugObjects",
);

type SetAllFlowObjectsPayload = {
  nodes: NodeEntity[];
  edges: EdgeEntity[];
};
export const setAllFlowObjects = createSessionAction<SetAllFlowObjectsPayload>(
  "session/setAllFlowObjects",
);
