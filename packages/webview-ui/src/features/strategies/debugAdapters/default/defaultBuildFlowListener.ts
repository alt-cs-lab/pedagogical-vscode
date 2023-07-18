import { EdgeEntity, NodeEntity, variableSelectors } from "../../../sessions/entities";
import { buildFlow, setAllFlowObjects } from "../../../sessions/sessionsSlice";
import { buildAppListener } from "../../listeners";

const edgeId = (sourceId: string | number, sourceName: string, targetId: string | number) => {
  return `${sourceId}[${sourceName}]-${targetId}`;
};

export const defaultBuildFlowListener = buildAppListener(
  buildFlow.match,
  (action, api) => {
    const session = api.getState().sessions[action.meta.sessionId];
    const nodes: NodeEntity[] = [];
    const edges: EdgeEntity[] = [];

    let xy = 0;

    for (const variable of variableSelectors.selectAll(session)) {
      const node: NodeEntity = {
        type: "commonVariables",
        data: { sessionId: session.id, variableId: variable.pedagogId },
        id: variable.pedagogId,
        position: { x: xy, y: xy },
      };
      nodes.push(node);

      xy += 20;

      const childVars = variable.variables;
      if (!childVars) { continue; }
      for (const childVar of childVars) {
        if (childVar.variablesReference === 0) { continue; }
        const childVarEntity = variableSelectors.selectByReference(session, childVar.variablesReference);
        if (childVarEntity === undefined) { continue; }

        const edge: EdgeEntity = {
          id: edgeId(variable.pedagogId, childVar.name, childVarEntity.pedagogId),
          source: variable.pedagogId,
          sourceHandle: childVar.name,
          target: childVarEntity.pedagogId,
        };
        edges.push(edge);
      }
    }

    api.dispatch(setAllFlowObjects(session.id, session.debugType, { nodes, edges }));
  },
);
