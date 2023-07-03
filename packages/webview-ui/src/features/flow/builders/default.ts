import { Session } from "../../sessions/sessionsSlice";
import { DebugNode } from "../nodes";
import { FlowState } from "../flowSlice";
import { Edge } from "reactflow";

const varsId = (ref: string | number) => `vars-${ref}`;
const edgeId = (sourceRef: string | number, sourceName: string, targetRef: string | number) => {
  return `${sourceRef}[${sourceName}]-${targetRef}`;
};
const handleId = (name: string) => `handle-${name}`;

export function defaultFlowBuilder(state: FlowState, session: Session) {
  state.nodes = [];
  state.edges = [];

  let xy = 0;

  for (const variablesReference in session.variableRefs) {
    const variables = session.variableRefs[variablesReference];
    const node: DebugNode = {
      type: "commonVariables",
      data: { variables: variables },
      id: varsId(variablesReference),
      position: { x: xy, y: xy },
    };
    state.nodes.push(node);

    xy += 20;

    // create an edge for each referenced child variable
    for (const childVar of variables.filter((v) => v.variablesReference > 0)) {
      const edge: Edge = {
        id: edgeId(variablesReference, childVar.name, childVar.variablesReference),
        source: node.id,
        sourceHandle: handleId(childVar.name),
        target: varsId(childVar.variablesReference),
        animated: true,
      };
      state.edges.push(edge);
    }
  }
}