import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { applyNodeChanges, NodeChange } from "reactflow";
import { SessionState } from "../../services/debugAdapterApi";
import { DebugNode } from "../nodes/nodeTypes";

type FlowState = {
  nodes: DebugNode[];
};

const initialState: FlowState = {
  nodes: [],
};

export const flowSlice = createSlice({
  name: "flow",
  initialState: initialState,
  reducers: {
    generateFlow: (state, action: PayloadAction<SessionState>) => {
      const session = action.payload;
      state.nodes = [];
      let xy = 0;
      for (const ref in session.variables) {
        const variables = session.variables[ref];
        if (variables === null) {
          continue;
        }
        const node: DebugNode = {
          type: "variables",
          id: `vars-${ref}`,
          data: variables,
          position: { x: xy, y: xy },
        };
        state.nodes.push(node);
        xy += 50;
      }
    },
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes) as DebugNode[];
    },
  },
});

export const { generateFlow, nodesChanged } = flowSlice.actions;
