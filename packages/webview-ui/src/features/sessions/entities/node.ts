import { createEntityAdapter } from "@reduxjs/toolkit";
import { PedagogNode } from "../../../components/nodes";

export type NodeEntity = PedagogNode;

export const nodesAdapter = createEntityAdapter<NodeEntity>();

// TODO: sorting -- nodes must appear after parent node if it has one
export const nodeSelectors = nodesAdapter.getSelectors();
