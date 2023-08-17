import { createEntityAdapter } from "@reduxjs/toolkit";
import { EdgeTypes, PedagogEdge } from "../../../components/edges";

export type EdgeEntity<T extends EdgeTypes = EdgeTypes> = PedagogEdge<T>;

export const edgesAdapter = createEntityAdapter<EdgeEntity>();

export const edgeSelectors = edgesAdapter.getSelectors();
