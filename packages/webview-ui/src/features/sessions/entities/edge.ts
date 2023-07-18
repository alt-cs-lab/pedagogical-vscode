import { createEntityAdapter } from "@reduxjs/toolkit";
import { Edge } from "reactflow";
import { Session } from "../sessionsSlice";

export type EdgeEntity = Edge;

export const edgesAdapter = createEntityAdapter<EdgeEntity>();

export const edgeSelectors = edgesAdapter.getSelectors((session: Session) => session.edges);
