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
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
    </div>
  )
};