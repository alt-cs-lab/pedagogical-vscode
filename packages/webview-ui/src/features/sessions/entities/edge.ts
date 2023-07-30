import { createEntityAdapter } from "@reduxjs/toolkit";
import { Edge } from "reactflow";

export type EdgeEntity = Edge;

export const edgesAdapter = createEntityAdapter<EdgeEntity>();

export const edgeSelectors = edgesAdapter.getSelectors();
