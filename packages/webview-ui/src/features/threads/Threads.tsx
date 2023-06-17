import { useGetThreadsQuery } from "../../services/debugAdapterApi";

export const Threads = () => {
  const { data, error, isLoading } = useGetThreadsQuery(undefined, { pollingInterval: 3000 });

  return (
    <div id="threads">
      <h2>Threads</h2>
      {error ? (
        <>There was an error getting the threads!</>
      ) : isLoading ? (
        <>Loading threads...</>
      ) : data ? (
        JSON.stringify(data)
      ) : null}
    </div>
  );
};
