import { DebugProtocol } from "@vscode/debugprotocol";
import { StackFrame } from "./StackFrame";

type StackTraceProps = {
  stackTrace: DebugProtocol.StackTraceResponse["body"];
};

export const StackTrace = (props: StackTraceProps) => {
  return (
    <>
      <h2>Stack Trace</h2>
      <div style={{ paddingLeft: 8 }}>
        {props.stackTrace.stackFrames.map((frame) => (
          <StackFrame key={frame.id} frame={frame} />
        ))}
      </div>
    </>
  );
};
