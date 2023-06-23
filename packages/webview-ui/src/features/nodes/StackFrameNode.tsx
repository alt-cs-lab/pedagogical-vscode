export type StackFrameNodeProps = {
  data: {
    name: string;
  };
};

export const StackFrameNode = ({ data }: StackFrameNodeProps) => {
  return (
    <div style={{ border: "solid black" }}>
      <h3>Stack Frame: {data.name}</h3>
    </div>
  );
};
