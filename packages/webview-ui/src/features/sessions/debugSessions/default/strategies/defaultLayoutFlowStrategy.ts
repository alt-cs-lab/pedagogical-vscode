import { BaseSessionState } from "../../BaseSession";
import { NodeChange } from "reactflow";
import ELK, { ElkNode } from "elkjs";
import { edgeSelectors, nodeSelectors } from "../../../entities";
import { isDevEnvironment } from "../../../../../store";
import { StackFrameData } from "../../../../../components/nodes/common/StackFrameNode";

const elk = new ELK();

const elkRootLayoutOptions: Record<string, string> = {
  algorithm: "layered",
  interactiveLayout: "true",
  "elk.direction": "RIGHT",
  "layering.strategy": "INTERACTIVE",
  "nodePlacement.strategy": "INTERACTIVE",
  "considerModelOrder.strategy": "NONE",
  edgeRouting: "POLYLINE",
  hierarchyHandling: "INCLUDE_CHILDREN",
  "spacing.nodeNode": "50",
  "spacing.nodeNodeBetweenLayers": "50",
  // Disable padding, otherwise nodes will move down slightly even if they shouldn't move
  "elk.padding": "[]",
};

const elkStackTraceLayoutOptions: Record<string, string> = {
  "crossingMinimization.semiInteractive": "true",
  // Extra padding at top so we have room for the stack trace header
  "elk.padding": "[top=34,left=12,bottom=12,right=12]",
  // Spacing between stack frame nodes
  "spacing.nodeNode": "8",
};

export default async function defaultLayoutNodesStrategy(
  state: Pick<BaseSessionState, "nodes" | "edges">,
): Promise<NodeChange[]> {
  // Get stack-trace node first so the stack frames can be placed in this hierarchy
  const stackTraceNode = nodeSelectors.selectById(state.nodes, "stack-trace");
  if (stackTraceNode === undefined) {
    throw new Error("defaultLayoutNodesStrategy expects a node with the id `stack-trace`");
  }
  const elkStackTraceNode: ElkNode = {
    id: stackTraceNode.id,
    layoutOptions: elkStackTraceLayoutOptions,
    labels: [{ text: "Stack Trace" }],
    children: [],
    x: stackTraceNode.position.x,
    y: stackTraceNode.position.y,
  };

  const elkRootNode: ElkNode = {
    id: "root",
    layoutOptions: elkRootLayoutOptions,
    children: [elkStackTraceNode],
    edges: edgeSelectors.selectAll(state.edges).map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  for (const node of nodeSelectors.selectAll(state.nodes)) {
    if (node.id === stackTraceNode.id) {
      continue;
    }

    if (node.type === "commonStackFrame") {
      const stackPosition = (node.data as StackFrameData).stackPosition;
      elkStackTraceNode.children!.push({
        id: node.id,
        width: node.data.measuredSize?.w ?? node.width ?? undefined,
        height: node.data.measuredSize?.h ?? node.height ?? undefined,
        labels: [{ text: node.data.name }],
        layoutOptions: {
          position: `(0,${stackPosition})`,
          alignment: "LEFT",
        },
      });
    } else {
      elkRootNode.children!.push({
        id: node.id,
        // x: node.data.isLayouted ? node.position.x : undefined,
        // y: node.data.isLayouted ? node.position.y : undefined,
        width: node.data.measuredSize?.w ?? node.width ?? undefined,
        height: node.data.measuredSize?.h ?? node.height ?? undefined,
        labels: node.data.name ? [{ text: node.data.name }] : undefined,
        ...(node.data.isLayouted ? { x: node.position.x, y: node.position.y } : undefined),
      });
    }
  }

  const layoutedGraph = await elk.layout(elkRootNode);
  isDevEnvironment && console.debug("Layouted graph:", JSON.stringify(layoutedGraph));

  const layoutedNodes: ElkNode[] = layoutedGraph.children!.flatMap((elkNode) => [
    {
      ...elkNode,
      children: undefined,
    },
    ...(elkNode.children ?? []),
  ]);

  const positionChanges: NodeChange[] = layoutedNodes.map((elkNode) => ({
    id: elkNode.id,
    type: "position",
    position: {
      x: elkNode.x!,
      y: elkNode.y!,
    },
  }));

  const layoutedStackTraceNode = layoutedNodes.find((elkNode) => elkNode.id === stackTraceNode.id);
  if (layoutedStackTraceNode === undefined) {
    throw new Error("ELK didn't return a `stack-trace` node");
  }
  const stackTraceChange: NodeChange = {
    id: stackTraceNode.id,
    type: "dimensions",
    dimensions: {
      height: layoutedStackTraceNode.height!,
      width: layoutedStackTraceNode.width!,
    },
    updateStyle: true,
  };

  return [...positionChanges, stackTraceChange];
}
