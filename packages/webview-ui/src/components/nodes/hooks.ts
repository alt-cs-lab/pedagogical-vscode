import { RefObject, useContext, useLayoutEffect } from "react";
import { useAppDispatch } from "../../hooks";
import { nodeMeasured } from "../../features/sessions/debugSessions/default/defaultActions";
import SessionContext from "../../features/sessions/SessionContext";
import { useNodeId } from "reactflow";
import { BaseNodeData } from "./base";

/**
 * Hook that dispatches the `nodeMeasured` action after the node is rendered
 * and its dimensions are measured.
 *
 * @param ref A reference to the root `div` element of the node which will be measured.
 * @param measuredSize The current `measuredSize` of the node data.
 */
export function useMeasureNode(
  ref: RefObject<HTMLDivElement | null>,
  measuredSize: BaseNodeData["measuredSize"],
) {
  const dispatch = useAppDispatch();
  const nodeId = useNodeId();
  const session = useContext(SessionContext);

  const offsetWidth = ref.current?.offsetWidth ?? 0;
  const offsetHeight = ref.current?.offsetHeight ?? 0;

  useLayoutEffect(() => {
    if (ref.current === null) {
      console.warn("useMeasureNode: ref.current is null. Did you forget to use the ref?");
      return;
    }

    if (!nodeId || !session) {
      return;
    }

    if (!measuredSize) {
      // Size hasn't been measured for this render yet, so report the measurement.
      const size = {
        h: offsetHeight,
        w: offsetWidth,
      };
      dispatch(nodeMeasured(session.id, { id: nodeId, size }));
    }
  }, [measuredSize, offsetWidth, offsetHeight]);
}
