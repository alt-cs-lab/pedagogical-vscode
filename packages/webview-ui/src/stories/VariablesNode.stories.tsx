import { Meta, StoryObj } from "@storybook/react";
import { ReactFlowProvider } from "reactflow";
import { VariablesNode } from "../features/nodes/VariablesNode";

// default export determines wehre story goes in the story list
const meta: Meta<typeof VariablesNode> = {
  component: VariablesNode,
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
type Story = StoryObj<typeof VariablesNode>;

export const FirstStory: Story = {
  args: {
    data: [
      {
        name: "i",
        value: "2",
        type: "int",
        evaluateName: "i",
        variablesReference: 0,
      },
      {
        name: "n",
        value: "10",
        type: "int",
        evaluateName: "n",
        variablesReference: 0,
      },
      {
        name: "nums",
        value: "[0, 1]",
        type: "list",
        evaluateName: "nums",
        variablesReference: 6,
      },
      {
        name: "more_nums",
        value: "[2, 3, 4, 5]",
        type: "list",
        evaluateName: "more_nums",
        variablesReference: 7,
      },
    ],
  },
};
