type MessageProps = {
  message: string;
};

export const Message = (props: MessageProps) => {
  return (
    <div>
      <pre>{props.message}</pre>
    </div>
  );
};
