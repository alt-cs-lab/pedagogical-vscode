import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { clearEvents } from "./eventsSlice";
import { Event } from "./Event";

export const Events = () => {
  const state = useAppSelector((state) => state.events);
  const dispatch = useAppDispatch();

  return (
    <>
      <h1>Events</h1>
      <VSCodeButton onClick={() => dispatch(clearEvents())} appearance="secondary">
        Clear Messages
      </VSCodeButton>
      <div>
        {state.events.map((ev) => (
          <Event key={ev.id} event={ev.event} />
        ))}
      </div>
    </>
  );
};
