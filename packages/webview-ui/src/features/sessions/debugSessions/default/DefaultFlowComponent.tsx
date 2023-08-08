import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { edgesAdapter, nodesAdapter } from "../../entities";
import {
  Background,
  Controls,
  ReactFlow,
  useNodesInitialized,
} from "reactflow";
import { layoutNodes, nodesChanged } from "./defaultActions";
import { nodeTypes } from "../../../../components/nodes";
import { useEffect, useLayoutEffect } from "react";

// helper component that triggers a callback when react nodes are initialized
const NodesInitializedHelper = (props: { onNodesInitialized: () => void }) => {
  const nodesInitialized = useNodesInitialized({
    includeHiddenNodes: false,
  });
  useEffect(() => {
    if (nodesInitialized) {
      props.onNodesInitialized();
    }
  }, [nodesInitialized]);
  return <></>;
};

const DefaultFlow = (props: { sessionId: string }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(
    (state) => state.sessions.sessionStates[props.sessionId]
  );

  const nodeSelectors = nodesAdapter.getSelectors();
  const edgeSelectors = edgesAdapter.getSelectors();

  const nodes = nodeSelectors.selectAll(state.nodes);
  const edges = edgeSelectors.selectAll(state.edges);

  useLayoutEffect(() => {
    dispatch(layoutNodes(props.sessionId));
  }, [state.lastFetch]);

  function onNodesInitialized() {
    dispatch(layoutNodes(props.sessionId));
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes) =>
        dispatch(nodesChanged(props.sessionId, { changes }))
      }
      nodeTypes={nodeTypes}
    >
      <NodesInitializedHelper onNodesInitialized={onNodesInitialized} />
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export function getDefaultFlowComponent() {
  return (props: { sessionId: string }) => DefaultFlow(props);
}
