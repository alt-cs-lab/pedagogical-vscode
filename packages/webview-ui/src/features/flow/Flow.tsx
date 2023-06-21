import ReactFlow, { Controls, Background } from "reactflow";
import { useAppDispatch, useAppSelector } from "../../hooks";
import "reactflow/dist/style.css";
import { useGetSessionQuery } from "../../services/debugAdapterApi";
import { nodesChanged } from "./flowSlice";

export const Flow = () => {
  const dispatch = useAppDispatch();
  useGetSessionQuery();
  const flow = useAppSelector((state) => state.flow);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow nodes={flow.nodes} onNodesChange={(changes) => dispatch(nodesChanged(changes))}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
