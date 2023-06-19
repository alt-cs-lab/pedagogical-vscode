import { DebugProtocol } from "@vscode/debugprotocol";
import { useGetStackTraceQuery } from "../../services/debugAdapterApi";

type ThreadProps = {
  thread: DebugProtocol.Thread;
};

export const Thread = (props: ThreadProps) => {
  const thread = props.thread;

  useGetStackTraceQuery({ threadId: thread.id });

  return <></>;
};
