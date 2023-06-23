export type StackFrameNodeProps = {
  data: {
    name: string;
  };
};

export const StackFrameNode = ({ data }: StackFrameNodeProps) => {
  return (
    <div style={{ border: "solid black", height: "100%" }}>
      <h3>Stack Frame: {data.name}</h3>
    </div>
  );
};
