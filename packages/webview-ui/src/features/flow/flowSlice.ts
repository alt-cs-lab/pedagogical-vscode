import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { applyNodeChanges, NodeChange, Node, Edge } from "reactflow";
import { SessionState } from "../../services/debugAdapterApi";
import { DebugNodeType } from "../nodes/types";

type FlowState = {
  nodes: DebugNodeType[];
  edges: Edge[];
};

const initialState: FlowState = {
  nodes: [],
  edges: [],
};

const stackId = (id: string | number) => `stack-${id}`;
const varsId = (ref: string | number) => `vars-${ref}`;
const edgeId = (source: string, target: string) => `${source}-${target}`;
const handleId = (name: string) => `handle-${name}`;
const newEdge = (sourceId: string, sourceName: string, targetId: string): Edge => ({
  id: edgeId(sourceId, targetId),
  source: sourceId,
  sourceHandle: handleId(sourceName),
  target: targetId,
  zIndex: 2000,
});

export const flowSlice = createSlice({
  name: "flow",
  initialState: initialState,
  reducers: {
    generateFlow: (state, action: PayloadAction<SessionState>) => {
      const session = action.payload;
      state.nodes = [];
      state.edges = [];
      let stackY = 0;

      const varRefsToAdd: number[] = [];

      // generate stack frame groups
      for (const frameId in session.stackFrames) {
        const frame = session.stackFrames[frameId];
        //const frame = session.stackFrames[frameId];
        const stackNode: DebugNodeType = {
          id: stackId(frame.id),
          type: "stackFrame",
          data: { name: frame.name },
          position: { x: 0, y: stackY },
          style: { width: 200, height: 500 },
        };
        state.nodes.push(stackNode);

        // add scopes inside each frame
        let scopeY = 30;
        for (const scope of session.scopes[frameId]) {
          const variables = session.variables[scope.variablesReference];
          if (!variables) {
            continue;
          }
          const varsNode: DebugNodeType = {
            id: varsId(scope.variablesReference),
            type: "variables",
            data: {
              variables: variables.map(($var) => ({
                name: $var.name,
                type: $var.type,
                value: $var.value,
                reference: $var.variablesReference,
              })),
            },
            position: { x: 20, y: scopeY },
            parentNode: stackId(frameId),
          };
          state.nodes.push(varsNode);
          scopeY += 200;

          for (const $var of variables) {
            const source = varsId(scope.variablesReference);
            const target = varsId($var.variablesReference);
            state.edges.push(newEdge(source, $var.name, target));
            varRefsToAdd.push($var.variablesReference);
          }
        }

        stackY += 550;
      }

      let varsX = 250;
      const varsAdded = new Set<number>();
      while (varRefsToAdd.length > 0) {
        const ref = varRefsToAdd.pop()!;
        if (varsAdded.has(ref)) {
          continue;
        }
        varsAdded.add(ref);

        let variables = session.variables[ref];
        if (!variables) {
          continue;
        }

        variables = variables.filter(
          ($var) => $var.name !== "special variables" && $var.name !== "function variables"
        );
        if (variables.length === 0) {
          continue;
        }

        const node: DebugNodeType = {
          type: "variables",
          id: varsId(ref),
          data: {
            variables: variables.map(($var) => ({
              name: $var.name,
              value: $var.value,
              reference: $var.variablesReference,
            })),
          },
          position: { x: varsX, y: 0 },
        };
        state.nodes.push(node);
        varsX += 250;

        for (const $var of variables) {
          if ($var.variablesReference > 0) {
            const source = varsId(ref);
            const target = varsId($var.variablesReference);
            state.edges.push(newEdge(source, $var.name, target));
            varRefsToAdd.push($var.variablesReference);
          }
        }
      }
    },
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes as Node<any>[]) as DebugNodeType[];
    },
  },
});

export const { generateFlow, nodesChanged } = flowSlice.actions;
