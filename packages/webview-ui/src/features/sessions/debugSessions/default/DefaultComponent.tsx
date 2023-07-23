import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { edgesAdapter, nodesAdapter } from "../../entities";
import { DefaultSessionState } from "./DefaultSession";
import { Background, Controls, ReactFlow } from "reactflow";
import { nodesChanged } from "./defaultActions";
import { nodeTypes } from "../../../flow/nodes";

const DefaultComponent = (props: { sessionId: string }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state[props.sessionId]) as DefaultSessionState;

  const nodeSelectors = useMemo(() => nodesAdapter.getSelectors(), []);
  const edgeSelectors = useMemo(() => edgesAdapter.getSelectors(), []);

  const nodes = useMemo(
    () => nodeSelectors.selectAll(state.nodes),
    [state.nodes.entities],
  );

  const edges = useMemo(
    () => edgeSelectors.selectAll(state.edges),
    [state.edges.entities],
  );

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

export default DefaultComponent;