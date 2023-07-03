import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { applyNodeChanges, NodeChange, Node, Edge } from "reactflow";
// import { SessionState } from "../../services/debugAdapterApi";
import { DebugNode } from "./nodes";
import { Session } from "../sessions/sessionsSlice";
import { defaultFlowBuilder } from "./builders/default";

export type FlowState = {
  nodes: DebugNode[];
  edges: Edge[];
};

const initialState: FlowState = {
  nodes: [],
  edges: [],
};

export const flowSlice = createSlice({
  name: "flow",
  initialState: initialState,
  reducers: {
    buildFlow: (state, action: PayloadAction<{ session: Session }>) => {
      // TODO: different builders for different debugger types
      defaultFlowBuilder(state, action.payload.session);
    },
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes as Node<any>[]) as DebugNode[];
    },
  },
});

export const { buildFlow, nodesChanged } = flowSlice.actions;
