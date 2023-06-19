import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetStackTraceQuery } from "../../services/debugAdapterApi";
import { StackTrace } from "../stackTrace/StackTrace";

type ThreadProps = {
  thread: DebugProtocol.Thread;
};

export const Thread = (props: ThreadProps) => {
  const thread = props.thread;
  const { data, error, isLoading } = useGetStackTraceQuery({ threadId: thread.id });

  return (
    <>
      <h1>Thread: {thread.name}</h1>
      <div style={{ paddingLeft: 8 }}>
        {error ? (
          "There was an error getting the stack trace!"
        ) : isLoading ? (
          "Loading stack trace..."
        ) : data ? (
          <StackTrace stackTrace={data} />
        ) : undefined}
      </div>
    </>
  );
};
