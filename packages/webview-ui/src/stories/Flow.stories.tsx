import { Meta, StoryObj } from "@storybook/react";
import { Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProps } from "reactflow";
import LoadingScreen from "../components/misc/LoadingScreen";
import NotSupportedBanner from "../components/misc/NotSupportedBanner";

const meta: Meta<typeof ReactFlow> = {
  component: ReactFlow,
};

export default meta;

type StoryProps = {
  loading: boolean,
  notSupportedVisible?: boolean,
  notSupportedName: string,
  flowProps?: ReactFlowProps,
};

export const Flow: StoryObj<StoryProps> = {
  render: (props: StoryProps) => {
    return (
      <div style={{ height: "100vh" }}>
        <NotSupportedBanner visible={props.notSupportedVisible} debugType={props.notSupportedName} />
        <LoadingScreen enabled={props.loading} />
        <ReactFlow {...props.flowProps}>
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </div>
    );
  },
  args: {
    loading: false,
    notSupportedVisible: false,
    notSupportedName: "cppdbg",
    flowProps: {
      nodes: [
        { id: "1", position: { x: 0, y: 0 }, data: { label: "Hello" } },
        { id: "2", position: { x: 200, y: 100 }, data: { label: "World!" } },
      ],
      edges: [
        { id: "1-2", source: "1", target: "2", },
      ],
    }
  }
};