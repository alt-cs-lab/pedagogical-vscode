import { Meta, StoryObj } from "@storybook/react";
import { ReactFlowProvider } from "reactflow";
import { DebugNodeContainer } from "../components/nodes";

// default export determines where story goes in the story list
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
      name: "MyVariableType",
      items: [
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

export const Array: Story = {
  args: {
    type: "commonArray",
    data: {
      name: "MyVariableType",
      items: [
        {
          name: "0",
          value: "10",
          showHandle: false,
        },
        {
          name: "1",
          value: '"Hello!"',
          showHandle: false,
        },
        {
          name: "2",
          value: "true",
          showHandle: true,
        },
        {
          name: "3",
          value: "None",
          showHandle: false,
        },
      ],
    },
  },
};

export const StackFrame: Story = {
  args: {
    type: "commonStackFrame",
    data: {
      name: "MyStackFrame",
      scopes: [
        {
          name: "Locals",
          items: [
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
        {
          name: "Globals",
          items: [
            {
              name: "globalOne",
              value: "1234",
              showHandle: false,
            },
            {
              name: "globalTwo",
              value: "[1, 2, 3]",
              showHandle: true,
            },
          ],
        },
      ],
    },
  },
};
