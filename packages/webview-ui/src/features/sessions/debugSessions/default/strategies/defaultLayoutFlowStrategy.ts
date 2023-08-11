import { BaseSessionState } from "../../BaseSession";
import { NodePositionChange } from "reactflow";
import ELK, { ElkNode } from "elkjs";
import { edgeSelectors, nodeSelectors } from "../../../entities";

const elk = new ELK();

const elkRootLayoutOptions: Record<string, string> = {
  "algorithm": "layered",
  "interactiveLayout": "true",
  "elk.direction": "RIGHT",
  "layering.strategy": "INTERACTIVE",
  "nodePlacement.strategy": "INTERACTIVE",
  "considerModelOrder.strategy": "NONE",
  "edgeRouting": "POLYLINE",
  "hierarchyHandling": "INCLUDE_CHILDREN",
  "spacing.nodeNode": "50",
  "spacing.nodeNodeBetweenLayers": "50",
};

const elkFramesLayoutOptions: Record<string, string> = {
  "crossingMinimization.semiInteractive": "true",
};

export default async function defaultLayoutNodesStrategy(state: Pick<BaseSessionState, "nodes" | "edges">): Promise<NodePositionChange[]> {
  // place stack frames in a seperate hierarchy
  const elkFramesNode: ElkNode = {
    id: "elkframes",
    layoutOptions: elkFramesLayoutOptions,
    children: [],
  };

  const elkRootNode: ElkNode = {
    id: "root",
    layoutOptions: elkRootLayoutOptions,
    children: [elkFramesNode],
    edges: edgeSelectors.selectAll(state.edges).map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  let stackPosition = 0;
  for (const node of nodeSelectors.selectAll(state.nodes)) {
    if (node.type === "commonStackFrame") {
      elkFramesNode.children!.push({
        id: node.id,
        width: node.width!,
        height: node.height!,
        labels: [{ text: node.data.name }],
        layoutOptions: {
          "position": `(0,${stackPosition++})`
        }
      });
    } else {
      elkRootNode.children!.push({
        id: node.id,
        // x: node.data.isLayouted ? node.position.x : undefined,
        // y: node.data.isLayouted ? node.position.y : undefined,
        width: node.width!,
        height: node.height!,
        labels: node.data.name ? [{ text: node.data.name }] : undefined,
        ... node.data.isLayouted ? { x: node.position.x, y: node.position.y } : undefined,
      });
    }
  }

  const layoutedGraph = await elk.layout(elkRootNode);
  const layoutedNodes = layoutedGraph.children!.flatMap((elkNode) => elkNode.children ? elkNode.children : elkNode);
  
  return layoutedNodes.map((elkNode) => ({
    id: elkNode.id,
    type: "position",
    position: {
      x: elkNode.x!,
      y: elkNode.y!,
    },
  }));
}