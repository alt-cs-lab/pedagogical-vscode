import { MarkerType } from "reactflow";
import { ScopeData } from "../../../../../components/nodes/common/StackFrameNode";
import { VariablesListItem } from "../../../../../components/nodes/common/VariablesList";
import { NodeEntity, EdgeEntity, VariablesEntity, stackFrameSelectors, scopeSelectors, variableSelectors, nodeSelectors } from "../../../entities";
import { BaseSessionState } from "../../BaseSession";

const edgeId = (sourceId: string | number, sourceName: string, targetId: string | number) =>
  `${sourceId}[${sourceName}]-${targetId}`;

async function defaultBuildFlowStrategy(
  state: Pick<BaseSessionState, "threads" | "stackFrames" | "scopes" | "variables" | "nodes" | "edges">,
): Promise<{ nodes: NodeEntity[], edges: EdgeEntity[] }> {
  const nodes: NodeEntity[] = [];
  const edges: EdgeEntity[] = [];

  // queue of variable nodes to add, along with their type for the node data
  const variableNodesToAdd: { entity: VariablesEntity, type: string | undefined }[] = [];
  const variableIdsAdded = new Set<string>();

  // start with stack frames and scopes
  for (const frame of stackFrameSelectors.selectAll(state.stackFrames)) {
    const frameNode: NodeEntity<"commonStackFrame"> = {
      type: "commonStackFrame",
      id: `frame-${frame.pedagogId}`,
      position: { x: 0, y: 0 },
      data: {
        name: "Stack Frame: " + frame.name,
        scopes: [],
      },
    };

    for (const scopeId of frame.scopeIds) {
      const scope = scopeSelectors.selectById(state.scopes, scopeId);
      if (!scope) { continue; }
      const variablesEntity = variableSelectors.selectByReference(
        state.variables,
        scope.variablesReference
      );
      
      const scopeData: ScopeData = {
        name: frame.scopeIds.length > 1 ? scope.name : undefined,
        lazy: scope.expensive,
      };
      frameNode.data.scopes.push(scopeData);

      if (!variablesEntity) {
        continue;
      }

      // create items for variables
      scopeData.items = [];
      for (const childVar of variablesEntity.variables) {
        const childVarEntity = childVar.variablesReference > 0
          ? variableSelectors.selectByReference(
            state.variables,
            childVar.variablesReference,
          )
          : undefined;
        
        const handleId = `${scope.name}[${childVar.name}]`;
        scopeData.items.push({
          name: childVar.name,
          value: childVar.value,
          lazy: childVar.presentationHint?.lazy,
          showHandle: childVarEntity !== undefined,
          handleId: handleId,
        });

        // create edge to another node if there is a childVarEntity
        // create edge from the handle to the childVar's node
        if (childVarEntity) {
          const edge: EdgeEntity = {
            id: edgeId(frameNode.id, handleId, childVarEntity.pedagogId),
            type: "floating",
            source: frameNode.id,
            sourceHandle: handleId,
            target: childVarEntity.pedagogId,
            style: {
              strokeWidth: 1.5,
            },
            markerEnd: {
              type: MarkerType.Arrow,
              height: 20,
              width: 20,
            }
          };
          edges.push(edge);
  
          // add childVar to the queue of variable nodes to add
          variableNodesToAdd.push({ entity: childVarEntity, type: childVar.type });
        }
      }
    }
    nodes.push(frameNode);
  }

  while (variableNodesToAdd.length > 0) {
    const variable = variableNodesToAdd.shift();

    // skip variable if we already have it
    if (variable === undefined || variableIdsAdded.has(variable.entity.pedagogId)) {
      continue;
    }

    const variablesListItems: VariablesListItem[] = [];
    let childVars = variable.entity.variables;

    // TODO: this only works for python
    const isArrayLike = variable.type === "list" || variable.type === "array" || variable.type === "tuple";
    if (isArrayLike) {
      childVars = childVars.filter(($var) => $var.evaluateName?.endsWith("]"));
    }

    for (const childVar of childVars) {
      const variablesListItem: VariablesListItem = {
        name: childVar.name,
        value: childVar.value,
        lazy: childVar.presentationHint?.lazy,
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
          type: "floating",
          source: variable.entity.pedagogId,
          sourceHandle: childVar.name,
          target: childVarEntity.pedagogId,
          style: {
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.Arrow,
            height: 20,
            width: 20,
          }
        };
        edges.push(edge);

        // add childVar to the queue of variable nodes to add
        variableNodesToAdd.push({ entity: childVarEntity, type: childVar.type });
      }

      variablesListItems.push(variablesListItem);
      variableIdsAdded.add(variable.entity.pedagogId);
    }

    const node: NodeEntity = {
        type: /*isArrayLike ? "commonArray" :*/ "commonVariables",
        data: {
          name: variable.type,
          items: variablesListItems,
        },
        id: variable.entity.pedagogId,
        position: { x: 0, y: 0 },
      };
    nodes.push(node);
  }

  // keep position (and other data) of original nodes if they existed
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const existingNode = nodeSelectors.selectById(state.nodes, node.id);
    if (existingNode) {
      nodes[i] = {
        ...existingNode,
        data: node.data,
      };
    }
  }

  return { nodes, edges };
}

export default defaultBuildFlowStrategy;
