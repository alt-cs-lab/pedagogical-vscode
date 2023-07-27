import ReactFlow, { Controls, Background } from "reactflow";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { nodeTypes } from "./nodes";
import { useMemo } from "react";
// import { nodesChanged } from "../sessions/sessionsSlice";
import { edgeSelectors, nodeSelectors } from "../sessions/entities";

export const Flow = () => {
  // useMemo so const isn't reinstantiated on every render
  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  const dispatch = useAppDispatch();

  const flowState = useAppSelector((state) => state.flow);
  const sessionId = flowState.currentSessionId;

  const session = useAppSelector((state) => state.sessions[sessionId]);

  const nodes = session ? nodeSelectors.selectAll(session) : [];
  const edges = session ? edgeSelectors.selectAll(session) : [];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // onNodesChange={(changes) => dispatch(nodesChanged({ sessionId, changes }))}
        nodeTypes={nodeTypesMemo}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
