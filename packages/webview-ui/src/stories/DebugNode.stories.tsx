import { Meta, StoryObj } from "@storybook/react";
import { ReactFlowProvider } from "reactflow";
import { DebugNode } from "../features/nodes/DebugNode";

// default export determines wehre story goes in the story list
const meta: Meta<typeof DebugNode> = {
  component: DebugNode,
  decorators: [
    (Story) => (
      <div style={{ width: "min-content", margin: "0 auto" }}>
        <ReactFlowProvider>
          <Story />
        </ReactFlowProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DebugNode>;

export const Variables: Story = {
  args: {
    type: "variables",
    data: {
      variables: [
        {
          name: "i",
          value: "2",
          type: "int",
          reference: 0,
        },
        {
          name: "n",
          value: "10",
          type: "int",
          reference: 0,
        },
        {
          name: "nums",
          value: "[0, 1]",
          type: "list",
          reference: 6,
        },
        {
          name: "more_nums",
          value: "[2, 3, 4, 5]",
          type: "list",
          reference: 7,
        },
      ],
    },
  },
};

export const StackFrame: Story = {
  args: {
    type: "stackFrame",
    data: {
      name: "<module>",
    },
  },
};
