import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { applyNodeChanges, NodeChange, Node, Edge } from "reactflow";
// import { SessionState } from "../../services/debugAdapterApi";
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
    // generateFlow: (state, action: PayloadAction<SessionState>) => {
    //   const session = action.payload;
    //   state.nodes = [];
    //   state.edges = [];
    //   let stackY = 0;

    //   const varRefsToAdd: number[] = [];
    //   const varRefTypeMap = new Map<number, string | undefined>();

    //   // generate stack frame groups
    //   for (const frameId in session.stackFrames) {
    //     const frame = session.stackFrames[frameId];

    //     for (const scope of session.scopes[frameId]) {
    //       let variables = session.variables[scope.variablesReference];
    //       if (!variables || scope.name === "Globals") {
    //         continue;
    //       }
    //       variables = variables.filter(
    //         ($var) => $var.name !== "special variables" && $var.name !== "function variables"
    //       );
    //       const scopeNode: DebugNodeType = {
    //         id: varsId(scope.variablesReference),
    //         type: "variables",
    //         data: {
    //           type: `Scope: ${frame.name}`,
    //           variables: variables.map(($var) => ({
    //             name: $var.name,
    //             type: $var.type,
    //             value: $var.value,
    //             reference: $var.variablesReference,
    //           })),
    //         },
    //         position: { x: 20, y: stackY },
    //         // parentNode: stackId(frameId),
    //       };
    //       state.nodes.push(scopeNode);
    //       // scopeY += 200;

    //       for (const $var of variables) {
    //         const source = varsId(scope.variablesReference);
    //         const target = varsId($var.variablesReference);
    //         state.edges.push(newEdge(source, $var.name, target));
    //         varRefsToAdd.push($var.variablesReference);
    //         varRefTypeMap.set($var.variablesReference, $var.type);
    //       }
    //     }

    //     stackY += 150;
    //   }

    //   let varsX = 250;
    //   const varsAdded = new Set<number>();
    //   while (varRefsToAdd.length > 0) {
    //     const ref = varRefsToAdd.pop()!;
    //     if (varsAdded.has(ref)) {
    //       continue;
    //     }
    //     varsAdded.add(ref);

    //     let variables = session.variables[ref];
    //     if (!variables) {
    //       continue;
    //     }

    //     variables = variables.filter(($var) => !$var.name.endsWith(" variables"));
    //     if (variables.length === 0) {
    //       continue;
    //     }

    //     const varNode: DebugNodeType = {
    //       type: "variables",
    //       id: varsId(ref),
    //       data: {
    //         type: varRefTypeMap.get(ref),
    //         variables: variables.map(($var) => ({
    //           name: $var.name,
    //           value: $var.value,
    //           reference: $var.variablesReference,
    //         })),
    //       },
    //       position: { x: varsX, y: 0 },
    //     };
    //     state.nodes.push(varNode);
    //     varsX += 300;

    //     for (const $var of variables) {
    //       if ($var.variablesReference > 0) {
    //         const source = varsId(ref);
    //         const target = varsId($var.variablesReference);
    //         state.edges.push(newEdge(source, $var.name, target));
    //         varRefsToAdd.push($var.variablesReference);
    //         varRefTypeMap.set($var.variablesReference, $var.type);
    //       }
    //     }
    //   }
    // },
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes as Node<any>[]) as DebugNodeType[];
    },
  },
});

export const { nodesChanged } = flowSlice.actions;
