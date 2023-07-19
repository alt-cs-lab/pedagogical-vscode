import { AnyAction, ListenerEffect, isAllOf } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { appStartListening } from "../../listenerMiddleware";
import { debugTypeMatcher, unknownDebugTypeMatcher } from "./matchers";
import { strategiesByDebugType } from "./strategies";

/**
 * An object that contains an action matcher and a listener effect. Use {@link buildAppListener}
 * because it gives you better type assertion with the matched action.
 * 
 * The effect will be triggered when the matcher is satisfied AND the session debug type matches.
 * 
 * @see {@link https://redux-toolkit.js.org/api/createListenerMiddleware} for more about redux listeners.
 */
export interface MatchActionListener {
  matcher: (action: any) => action is any;
  effect: ListenerEffect<any, RootState, AppDispatch>;
}

/**
 * Build an match action listener that can be passed to startListening or addListener.
 * 
 * In this app, the effect will run if the matcher is satisfied AND the session debug type matches.
 */
export function buildAppListener<MA extends AnyAction>(
  matcher: (action: any) => action is MA,
  effect: ListenerEffect<MA, RootState, AppDispatch>
): MatchActionListener {
  return { matcher, effect };
}

/**
 * Start all listeners defined in the debug type strategies.
 *
 * Each listener is given an additional matcher to match its debug type.
 * If the debug type is not registered, it will go to "default".
 */
export function registerDebugListeners() {
  for (const debugType in strategiesByDebugType) {
    const extraMatcher = debugType === "default"
        ? unknownDebugTypeMatcher
        : debugTypeMatcher(debugType);

    for (const listener of strategiesByDebugType[debugType].listeners) {
      appStartListening({
        matcher: isAllOf(listener.matcher, extraMatcher),
        effect: listener.effect,
      });
    }
  }
}
