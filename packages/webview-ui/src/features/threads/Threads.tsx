import "./Threads.css";
import { useGetThreadsQuery } from "../../services/debugAdapterApi";
import { Thread } from "./Thread";

export const Threads = () => {
  const { data, error, isLoading } = useGetThreadsQuery(undefined);

  return (
    <div id="threads">
      <h2>Threads</h2>
      {error ? (
        <>There was an error getting the threads!</>
      ) : isLoading ? (
        <>Loading threads...</>
      ) : data ? (
        data.threads?.map((thread) => <Thread key={thread.id} thread={thread} />)
      ) : null}
    </div>
  );
};
