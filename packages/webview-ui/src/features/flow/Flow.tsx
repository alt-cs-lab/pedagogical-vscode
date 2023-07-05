import ReactFlow, { Controls, Background } from "reactflow";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { nodesChanged } from "./flowSlice";
import { nodeTypes } from "./nodes";
import { useMemo } from "react";

import "reactflow/dist/style.css";

export const Flow = () => {
  const dispatch = useAppDispatch();
  const flow = useAppSelector((state) => state.flow);

  // useMemo so const isn't reinstantiated on every render
  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        onNodesChange={(changes) => dispatch(nodesChanged(changes))}
        nodeTypes={nodeTypesMemo}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
