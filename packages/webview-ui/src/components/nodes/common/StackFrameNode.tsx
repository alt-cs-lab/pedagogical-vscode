import { NodeProps } from "reactflow";
import { VariablesList, VariablesListItem } from "./VariablesList";

import "./CommonNode.css";

export type StackFrameData = {
  name: string;
  scopes: ScopeData[];
};

export type ScopeData = {
  name?: string;
  items: VariablesListItem[];
};

export default function StackFrameNode(props: NodeProps<StackFrameData>) {
  return (
    <div className="common-node">
      <div className="common-node-header">{props.data.name}</div>
      {props.data.scopes.map((scopeData) => (
        <>
          <hr />
          <div className="stack-frame-scope" key={scopeData.name}>
            {scopeData.name ? (
              <div className="common-node-header">{scopeData.name}</div>
            ) : null}
            <VariablesList items={scopeData.items} />
          </div>
        </>
      ))}
    </div>
  );
}