import { DebugNode } from "../nodes";
import { Edge } from "reactflow";
import { variableSelectors } from "../../sessions/entities";
import { RootState } from "../../../store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Session } from "../../sessions/sessionsSlice";

const edgeId = (sourceId: string | number, sourceName: string, targetId: string | number) => {
  return `${sourceId}[${sourceName}]-${targetId}`;
};

type BuildFlowThunkConfig = {
  state: RootState,
  pendingMeta: { sessionId: string, debugType: string },
  fulfilledMeta: { sessionId: string, debugType: string },
  rejectedMeta: { sessionId: string, debugType: string },
};

type BuildFlowArgs = { sessionId: string };
type BuildFlowReturn = {
  nodes: DebugNode[];
  edges: Edge[];
};
export const buildFlow = createAsyncThunk<BuildFlowReturn, BuildFlowArgs, BuildFlowThunkConfig>(
  "flow/build",
  (args, thunkApi) => {
    // TODO: different builders for different debugger types
    // TODO: incremental changes so position data isn't changed
    const state = thunkApi.getState() as RootState;
    const session = state.sessions[args.sessionId];
    const result = defaultFlowBuilder(session);
    return thunkApi.fulfillWithValue(result, { sessionId: session.id, debugType: session.debugType });
  },
  {
    getPendingMeta: (base, thunkApi) => {
      const session = thunkApi.getState().sessions[base.arg.sessionId];
      return { sessionId: session.id, debugType: session.debugType };
    }
  }
);

export function defaultFlowBuilder(session: Session): BuildFlowReturn {
  const nodes: DebugNode[] = [];
  const edges: Edge[] = [];

  let xy = 0;

  const variableIds = variableSelectors.selectIds(session);
  for (const variableId of variableIds) {
    const node: DebugNode = {
      type: "commonVariables",
      data: { sessionId: session.id, variableId },
      id: variableId.toString(),
      position: { x: xy, y: xy },
    };
    nodes.push(node);

    xy += 20;

    const childVars = variableSelectors.selectById(session, variableId);
    if (!childVars) { continue; }
    for (const childVar of childVars.variables) {
      if (childVar.variablesReference === 0) { continue; }
      const childVarEntity = variableSelectors.selectByReference(session, childVar.variablesReference);
      if (childVarEntity === undefined) { continue; }

      const edge: Edge = {
        id: edgeId(variableId, childVar.name, childVarEntity.pedagogId),
        source: variableId.toString(),
        sourceHandle: childVar.name,
        target: childVarEntity.pedagogId,
      };
      edges.push(edge);
    }
  }

  return { nodes, edges };
}
