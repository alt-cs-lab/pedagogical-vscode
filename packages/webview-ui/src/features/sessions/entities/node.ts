import { createEntityAdapter } from "@reduxjs/toolkit";
import { DebugNode } from "../../flow/nodes";
import { Session } from "../../sessions/sessionsSlice";

export type NodeEntity = DebugNode;

export const nodesAdapter = createEntityAdapter<NodeEntity>();

// TODO: sorting -- nodes must appear after parent node if it has one
export const nodeSelectors = nodesAdapter.getSelectors((session: Session) => session.nodes);
