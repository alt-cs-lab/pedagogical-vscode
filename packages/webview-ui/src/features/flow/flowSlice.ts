import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { applyNodeChanges, NodeChange, Node, Edge } from "reactflow";
// import { SessionState } from "../../services/debugAdapterApi";
import { DebugNode } from "./nodes";
import { buildFlow } from "./builders/default";

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
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes as Node<any>[]) as DebugNode[];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(buildFlow.fulfilled, (state, action) => {
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
    });
    builder.addCase(buildFlow.rejected, (_state, action) => {
      console.log("build flow state failed!!!!");
      console.log(action);
    });
  }
});

export const { nodesChanged } = flowSlice.actions;
