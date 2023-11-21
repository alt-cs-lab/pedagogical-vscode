import { useEffect, useMemo } from "react";
import { Background, Controls, ReactFlow, useNodesInitialized } from "reactflow";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { edgesAdapter, nodesAdapter } from "../../entities";
import { layoutNodes, nodesChanged } from "./defaultActions";
import { nodeTypes } from "../../../../components/nodes";
import { edgeTypes } from "../../../../components/edges";
import LoadingScreen from "../../../../components/misc/LoadingScreen";
import NotSupportedBanner from "../../../../components/misc/NotSupportedBanner";
import { isDebugTypeSupported } from "..";

import "./DefaultFlowComponent.css";

const DefaultFlow = (props: { sessionId: string }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(
    (state) => state.sessions.sessionStates[props.sessionId]
  );

  const sessionEntity = useAppSelector((state) => state.sessions.sessionEntities.entities[props.sessionId]);
  const debugTypeSupported = useMemo(() => isDebugTypeSupported(sessionEntity!.type), []);

  const nodeSelectors = nodesAdapter.getSelectors();
  const edgeSelectors = edgesAdapter.getSelectors();

  const nodes = nodeSelectors.selectAll(state.nodes);
  const edges = edgeSelectors.selectAll(state.edges);

  const nodesInitialized = useNodesInitialized({ includeHiddenNodes: false });
  useEffect(() => {
    if (nodesInitialized) {
      dispatch(layoutNodes(props.sessionId));
    }
  }, [nodesInitialized]);

  return <>
    <NotSupportedBanner visible={!debugTypeSupported} debugType={sessionEntity!.type}  />
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes) =>
        dispatch(nodesChanged(props.sessionId, { changes }))
      }
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    >
      <LoadingScreen enabled={state.loading} />
      <Background />
      <Controls />
    </ReactFlow>
  </>;
};

export function getDefaultFlowComponent() {
  return (props: { sessionId: string }) => DefaultFlow(props);
}
