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

  // const session = useAppSelector((state) => state.session);
  // useGetThreadsQuery(undefined);

  // const threads = useAppSelector((state) => state.session.threads);
  // const stackFrames = useAppSelector((state) => state.session.stackFrames);
  // const scopes = useAppSelector((state) => state.session.scopes);
  // const variablesRefs = useAppSelector((state) => state.session.variables);

  // return (
  //   <>
  //     {Object.keys(threads).map((key) => (
  //       <Thread key={key} thread={session.threads[key as unknown as number]} />
  //     ))}
  //     {Object.keys(stackFrames).map((key) => (
  //       <StackFrame key={key} frame={session.stackFrames[key as unknown as number]} />
  //     ))}
  //     {Object.keys(scopes).map((key) => (
  //       <Scope key={key} scope={session.scopes[key as unknown as number]} />
  //     ))}
  //     {Object.keys(variablesRefs).map((key) => {
  //       const variables = session.variables[key as unknown as number];
  //       return variables?.map((variable) => (
  //         <Variable key={`${key},${variable.name}`} variable={variable} />
  //       ));
  //     })}
  //   </>
  // );
};
