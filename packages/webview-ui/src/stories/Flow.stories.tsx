import { Meta, StoryObj } from "@storybook/react";
import { Background, BackgroundVariant, Controls, ReactFlow } from "reactflow";

const meta: Meta<typeof ReactFlow> = {
  component: ReactFlow,
};

export default meta;

export const Flow: StoryObj<typeof ReactFlow> = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <ReactFlow>
        <Background id="1" gap={10} color="#f1f1f1" variant={BackgroundVariant.Lines} />
        <Background id="2" gap={100} offset={1} color="#ccc" variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>
    </div>
  )
};