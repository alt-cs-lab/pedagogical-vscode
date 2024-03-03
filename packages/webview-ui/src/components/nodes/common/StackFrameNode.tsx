import "./CommonNode.css";
import "./StackFrameNode.css";
import { NodeProps } from "reactflow";
import { VariablesList, VariablesListItem } from "./VariablesList";
import { BaseNodeData } from "../base";
import { useRef } from "react";
import { useMeasureNode } from "../hooks";

export type StackFrameData = BaseNodeData & {
  scopes: ScopeData[];
  stackPosition: number;
};

export type ScopeData = {
  name: string;
  lazy?: boolean;
  items?: VariablesListItem[];
};

export default function StackFrameNode(props: NodeProps<StackFrameData>) {
  const divRef = useRef<HTMLDivElement | null>(null);
  useMeasureNode(divRef, props.data.measuredSize);

  return (
    <div ref={divRef} className="common-node stack-frame-node">
      <div className="common-node-header">{props.data.name}</div>
      {props.data.scopes.map((scopeData) => (
        <div className="common-node stack-frame-scope" key={scopeData.name}>
          {props.data.scopes.length > 1 ? (
            <div className="common-node-header">{scopeData.name}</div>
          ) : null}
          {scopeData.lazy ? <div>(lazy)</div> : null}
          {scopeData.items ? <VariablesList nodeId={props.id} items={scopeData.items} /> : null}
        </div>
      ))}
    </div>
  );
}
