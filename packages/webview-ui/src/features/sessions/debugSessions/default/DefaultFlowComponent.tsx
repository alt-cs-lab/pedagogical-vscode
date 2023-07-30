import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { edgesAdapter, nodesAdapter } from "../../entities";
import { DefaultSessionState } from "./DefaultSession";
import { Background, Controls, ReactFlow } from "reactflow";
import { nodesChanged } from "./defaultActions";
import { nodeTypes } from "../../../flow/nodes";

const DefaultFlow = (props: { sessionId: string }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state[props.sessionId]) as DefaultSessionState;

  const nodeSelectors = nodesAdapter.getSelectors();
  const edgeSelectors = edgesAdapter.getSelectors();

  const nodes = nodeSelectors.selectAll(state.nodes);
  const edges = edgeSelectors.selectAll(state.edges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes) => dispatch(nodesChanged(props.sessionId, { changes }))}
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export function getDefaultFlowComponent() {
  return (props: { sessionId: string }) => DefaultFlow(props);
}
