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
    type: "defaultVariables",
    data: {
      variables: [
        {
          name: "i",
          value: "2",
          type: "int",
          variablesReference: 0,
        },
        {
          name: "n",
          value: "10",
          type: "int",
          variablesReference: 0,
        },
        {
          name: "nums",
          value: "[0, 1]",
          type: "list",
          variablesReference: 6,
        },
        {
          name: "more_nums",
          value: "[2, 3, 4, 5]",
          type: "list",
          variablesReference: 7,
        },
      ],
    },
  },
};

// export const StackFrame: Story = {
//   args: {
//     type: "stackFrame",
//     data: {
//       name: "<module>",
//     },
//   },
// };
