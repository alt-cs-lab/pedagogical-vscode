import { createEntityAdapter } from "@reduxjs/toolkit";
import { NodeTypes, PedagogNode } from "../../../components/nodes";

export type NodeEntity<T extends NodeTypes = NodeTypes> = PedagogNode<T>;

export const nodesAdapter = createEntityAdapter<NodeEntity>();

// TODO: sorting -- nodes must appear after parent node if it has one
export const nodeSelectors = nodesAdapter.getSelectors();
