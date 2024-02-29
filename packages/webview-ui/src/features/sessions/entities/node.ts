import { createEntityAdapter } from "@reduxjs/toolkit";
import { NodeTypes, PedagogNode } from "../../../components/nodes";

export type NodeEntity<T extends NodeTypes = NodeTypes> = PedagogNode<T>;

export const nodesAdapter = createEntityAdapter<NodeEntity>({
  sortComparer: (a, b) => {
    // For sub flows to work, parent nodes need to be before child nodes.
    // https://reactflow.dev/learn/layouting/sub-flows
    // The stack trace nodes is the only "grouping" node right now.
    if (a.type === "commonStackTrace" && b.type !== "commonStackTrace") {
      return -1;
    } else if (a.type !== "commonStackTrace" && b.type === "commonStackTrace") {
      return 1;
    }
    // At this point sort doesn't matter, so just sort by id.
    return a.id.localeCompare(b.id);
  },
});

export const nodeSelectors = nodesAdapter.getSelectors();
