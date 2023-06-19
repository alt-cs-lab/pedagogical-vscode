import { useAppSelector } from "../../hooks";
import { useGetThreadsQuery } from "../../services/debugAdapterApi";
import { Scope } from "../scopes/Scope";
import { StackFrame } from "../stackTrace/StackFrame";
import { Thread } from "../threads/Thread";
import { Variable } from "../variables/Variable";

export const DebugSession = () => {
  const session = useAppSelector((state) => state.session);
  useGetThreadsQuery(undefined);

  const threadKeys = Object.keys(session.threads);
  const stackFrameKeys = Object.keys(session.stackFrames);
  const scopeKeys = Object.keys(session.scopes);
  const variableRefKeys = Object.keys(session.variableRefs);

  return (
    <>
      {threadKeys.map((key) => (
        <Thread key={key} thread={session.threads[key as unknown as number]} />
      ))}
      {stackFrameKeys.map((key) => (
        <StackFrame key={key} frame={session.stackFrames[key as unknown as number]} />
      ))}
      {scopeKeys.map((key) => (
        <Scope key={key} scope={session.scopes[key as unknown as number]} />
      ))}
      {variableRefKeys.map((key) => {
        const variables = session.variableRefs[key as unknown as number];
        return variables.map((variable) => (
          <Variable key={`${key},${variable.name}`} variable={variable} />
        ));
      })}
    </>
  );
};
