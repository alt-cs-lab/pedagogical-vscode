import { VariablesListItem } from "../../../../../components/nodes/common/VariablesList";
import { NodeEntity, EdgeEntity, VariablesEntity, stackFrameSelectors, scopeSelectors, variableSelectors, nodeSelectors } from "../../../entities";
import { DefaultSessionState } from "../DefaultSession";

const edgeId = (sourceId: string | number, sourceName: string, targetId: string | number) =>
  `${sourceId}[${sourceName}]-${targetId}`;

async function defaultBuildFlowStrategy(
  state: Pick<DefaultSessionState, "threads" | "stackFrames" | "scopes" | "variables" | "nodes" | "edges">,
): Promise<{ nodes: NodeEntity[], edges: EdgeEntity[] }> {
  const nodes: NodeEntity[] = [];
  const edges: EdgeEntity[] = [];

  // queue of variable nodes to add, along with their type for the node data
  const variableNodesToAdd: { entity: VariablesEntity, type: string | undefined }[] = [];
  const variableIdsAdded = new Set<string>();

  let xy = 0;

  // start with stack frames and scopes
  for (const frame of stackFrameSelectors.selectAll(state.stackFrames)) {
    for (const scopeId of frame.scopeIds) {
      const scope = scopeSelectors.selectById(state.scopes, scopeId);
      if (scope === undefined) {
        continue;
      }

      const variablesEntity = variableSelectors.selectByReference(
        state.variables,
        scope.variablesReference
      );
      if (variablesEntity) {
        variableNodesToAdd.push({
          entity: variablesEntity,
          type: `Stack Frame: ${frame.name} (${scope.name})`
        });
      }
    }
  }

  while (variableNodesToAdd.length > 0) {
    const variable = variableNodesToAdd.shift();

    // skip variable if we already have it
    if (variable === undefined || variableIdsAdded.has(variable.entity.pedagogId)) {
      continue;
    }

    const variablesListItems: VariablesListItem[] = [];
    const childVars = variable.entity.variables;

    for (const childVar of childVars) {
      const variablesListItem: VariablesListItem = {
        name: childVar.name,
        value: childVar.value,
        showHandle: false,
      };

      const childVarEntity = childVar.variablesReference > 0
        ? variableSelectors.selectByReference(
          state.variables,
          childVar.variablesReference
        )
        : undefined;

      if (childVarEntity) {
        // show handle for this variable in the variables list
        variablesListItem.showHandle = true;

        // create edge from the handle to the childVar's node
        const edge: EdgeEntity = {
          id: edgeId(variable.entity.pedagogId, childVar.name, childVarEntity.pedagogId),
          source: variable.entity.pedagogId,
          sourceHandle: childVar.name,
          target: childVarEntity.pedagogId,
        };
        edges.push(edge);

        // add childVar to the queue of variable nodes to add
        variableNodesToAdd.push({ entity: childVarEntity, type: childVar.type });
      }

      variablesListItems.push(variablesListItem);
      variableIdsAdded.add(variable.entity.pedagogId);
    }

    // if we already have a node with this id, update it
    // otherwise, create a new one
    const nodeId = variable.entity.pedagogId;
    const existingNode = nodeSelectors.selectById(state.nodes, nodeId);
    let node: NodeEntity;
    if (existingNode) {
      node = {
        ...existingNode,
        data: {
          type: variable.type,
          variablesListItems,
        }
      };
    } else {
      node = {
        type: "commonVariables",
        data: {
          type: variable.type,
          variablesListItems,
        },
        id: variable.entity.pedagogId,
        position: { x: xy, y: xy },
      };
      xy += 20;
    }
    nodes.push(node);
  }

  return { nodes, edges };
  // api.dispatch(setAllFlowObjects(session.id, session.debugType, { nodes, edges }));
}

export default defaultBuildFlowStrategy;
