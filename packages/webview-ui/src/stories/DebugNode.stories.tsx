import { Meta, StoryObj } from "@storybook/react";
import { ReactFlowProvider } from "reactflow";
import { DebugNodeContainer } from "../features/flow/nodes";

// default export determines wehre story goes in the story list
const meta: Meta<typeof DebugNodeContainer> = {
  component: DebugNodeContainer,
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
type Story = StoryObj<typeof DebugNodeContainer>;

export const Variables: Story = {
  args: {
    type: "commonVariables",
    data: {
      type: "MyVariableType",
      variablesListItems: [
        {
          name: "i",
          value: "2",
          showHandle: false,
        },
        {
          name: "n",
          value: "10",
          showHandle: false,
        },
        {
          name: "nums",
          value: "[0, 1]",
          showHandle: true,
        },
        {
          name: "more_nums",
          value: "[2, 3, 4, 5]",
          showHandle: true,
        },
      ],
    },
  },
};