import { useAppDispatch, useAppSelector } from "../../hooks";
import { useGetScopesQuery } from "../../services/debugAdapterApi";
import { Scope } from "./Scope";

export const Scopes = () => {
  // TODO: get frameId from stackFrame first
  //const { data, error, isLoading } = useGetScopesQuery({ })
  const state = useAppSelector((state) => state.scopes);

  return (
    <>
      <h2>Scopes</h2>
      <div>
        {state.scopes.map((s) => (
          <Scope key={s.variablesReference} scope={s} />
        ))}
      </div>
    </>
  );
};
