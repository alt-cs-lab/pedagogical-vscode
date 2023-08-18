import { Meta, StoryObj } from "@storybook/react";
import { Background, BackgroundVariant, Controls, ReactFlow } from "reactflow";
import LoadingScreen from "../components/misc/LoadingScreen";

const meta: Meta<typeof ReactFlow> = {
  component: ReactFlow,
};

export default meta;

export const Flow: StoryObj<typeof ReactFlow> = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <LoadingScreen enabled={true} />
      <ReactFlow>
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
    </div>
  )
};