import "./DefaultFlowComponent.css";
import { Background, Controls, ReactFlow } from "reactflow";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { edgesAdapter, nodesAdapter } from "../../entities";
import { nodesChanged } from "./defaultActions";
import { nodeTypes } from "../../../../components/nodes";
import { edgeTypes } from "../../../../components/edges";
import LoadingScreen from "../../../../components/misc/LoadingScreen";
import SessionContext from "../../SessionContext";

const DefaultFlow = (props: { sessionId: string }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.sessions.sessionStates[props.sessionId]);

  const sessionEntity = useAppSelector(
    (state) => state.sessions.sessionEntities.entities[props.sessionId],
  );

  const nodeSelectors = nodesAdapter.getSelectors();
  const edgeSelectors = edgesAdapter.getSelectors();

  const nodes = nodeSelectors.selectAll(state.nodes);
  const edges = edgeSelectors.selectAll(state.edges);

  return (
    <SessionContext.Provider value={sessionEntity}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => dispatch(nodesChanged(props.sessionId, { changes }))}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <LoadingScreen enabled={state.loading} />
        <Background />
        <Controls />
      </ReactFlow>
    </SessionContext.Provider>
  );
};

export function getDefaultFlowComponent() {
  return (props: { sessionId: string }) => DefaultFlow(props);
}
