import { DebugEvent } from "shared";

type EventProps = {
  event: DebugEvent;
};

export const Event = (props: EventProps) => {
  return (
    <div style={{ border: "2 solid lightblue" }}>
      <b>{props.event.event}</b>
      <pre>{JSON.stringify(props.event.body, undefined, 2)}</pre>
    </div>
  );
};
