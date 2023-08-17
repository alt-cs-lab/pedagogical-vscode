import { useCallback } from "react";
import {
  useStore as useReactFlowStore,
  BaseEdge,
  EdgeProps,
  Node,
  Position,
  getBezierPath,
} from "reactflow";

function getNodeIntersection(intersectionNode: Node, targetX: number, targetY: number) {
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    positionAbsolute: intersectionNodePosition,
  } = intersectionNode;

  const w = intersectionNodeWidth! / 2;
  const h = intersectionNodeHeight! / 2;

  const x2 = intersectionNodePosition!.x + w;
  const y2 = intersectionNodePosition!.y + h;
  const x1 = targetX + w;
  const y1 = targetY + h;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

function getEdgePosition(node: Node, intersectionPoint: { x: number, y: number }) {
  const n = { ...node.positionAbsolute, ...node };
  const nx = Math.round(n.x!);
  const ny = Math.round(n.y!);
  const px = Math.round(intersectionPoint.x!);
  const py = Math.round(intersectionPoint.y!);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.width! - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny! + n.height! - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

function getEdgeTargetParams(source: Node, target: Node) {
  const targetIntersectionPoint = getNodeIntersection(target, source.position.x, source.position.y);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);
  return {
    x: targetIntersectionPoint.x,
    y: targetIntersectionPoint.y,
    pos: targetPos,
  };
}

export default function FloatingEdge(props: EdgeProps) {
  const sourceNode = useReactFlowStore(useCallback((store) => store.nodeInternals.get(props.source), [props.source]));
  const targetNode = useReactFlowStore(useCallback((store) => store.nodeInternals.get(props.target), [props.target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const target = getEdgeTargetParams(sourceNode, targetNode);

  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: target.x,
    targetY: target.y,
    targetPosition: target.pos,
  });

  return <BaseEdge path={edgePath} {...props} />;
}