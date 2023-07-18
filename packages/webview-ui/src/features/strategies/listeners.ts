import { AnyAction, ListenerEffect, isAllOf } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { appStartListening } from "../../listenerMiddleware";
import { debugTypeMatcher, unknownDebugTypeMatcher } from "./matchers";
import { strategiesByDebugType } from "./strategies";

export interface MatchActionListener {
  matcher: (action: any) => action is any;
  effect: ListenerEffect<any, RootState, AppDispatch>;
}

/** Build an match action listener that can be passed to startListening or addListener. */
export function buildAppListener<MA extends AnyAction>(
  matcher: (action: any) => action is MA,
  effect: ListenerEffect<MA, RootState, AppDispatch>
): MatchActionListener {
  return { matcher, effect };
}

/**
 * Start all listeners defined in the debug type strategies.
 *
 * Each listener is given an additional matcher to match its debug type
 * (or no debug type if it is default).
 */
export function registerDebugListeners() {
  for (const debugType in strategiesByDebugType) {
    const extraMatcher = debugType === "default"
        ? unknownDebugTypeMatcher
        : debugTypeMatcher(debugType);

    for (const listener of strategiesByDebugType[debugType].getListeners) {
      appStartListening({
        matcher: isAllOf(listener.matcher, extraMatcher),
        effect: listener.effect,
      });
    }
  }
}
