import { useGetSessionQuery } from "../../services/debugAdapterApi";

export const DebugSession = () => {
  const { data, error, isLoading } = useGetSessionQuery();

  return (
    <>
      {isLoading ? (
        <div>loading</div>
      ) : error ? (
        <div>error!</div>
      ) : data ? (
        <pre>{JSON.stringify(data, undefined, 2)}</pre>
      ) : null}
    </>
  );
};
