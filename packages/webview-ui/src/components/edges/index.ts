import { Edge } from "reactflow";
import FloatingEdge from "./FloatingEdge";

export const edgeTypes = {
  floating: FloatingEdge,
};

export type EdgeTypes = keyof typeof edgeTypes;

export type PedagogEdge<T extends EdgeTypes = EdgeTypes> = Edge<
  Parameters<(typeof edgeTypes)[T]>[0]["data"]
> & { type?: T };
