import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Node, applyNodeChanges, NodeChange } from "reactflow";
import { DebugProtocol as DP } from "@vscode/debugprotocol";
import { SessionState } from "../../services/debugAdapterApi";

type FlowState = {
  nodes: Node /*<DP.Variable[]>*/[];
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
        const node: Node = {
          id: `var${ref}`,
          data: { label: "Variables: " + variables.map(($var) => $var.name).join("\n") },
          position: { x: xy, y: xy },
        };
        state.nodes.push(node);
        xy += 50;
      }
    },
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
  },
});

export const { generateFlow, nodesChanged } = flowSlice.actions;
