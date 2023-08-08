import { edgeSelectors, nodeSelectors } from "../../../entities";
import { BaseSessionState } from "../../BaseSession";
import dagre from "@dagrejs/dagre";
import { NodePositionChange } from "reactflow";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export default function defaultLayoutNodesStrategy(state: Pick<BaseSessionState, "nodes" | "edges">): NodePositionChange[] {
  dagreGraph.setGraph({
    rankdir: "LR"
  });

  for (const node of nodeSelectors.selectAll(state.nodes)) {
    dagreGraph.setNode(node.id, { width: node.width, height: node.height });
  }
  for (const edge of edgeSelectors.selectAll(state.edges)) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  return dagreGraph.nodes().map((id) => {
    const updatedNode = dagreGraph.node(id);
    return {
      id,
      type: "position",
      position: {
        x: updatedNode.x,
        y: updatedNode.y,
      },
    };
  });
}