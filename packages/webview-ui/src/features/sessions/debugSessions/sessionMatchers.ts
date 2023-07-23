import { AnyAction } from "redux";

/**
 * Convenience function that wraps a match action function to also check it's session ID.
 * This keeps the same type gaurd as the matcher function, and is good for building
 * listeners or reducers.
 * 
 * @param id Session ID
 * @param matcher Match function, like one given by an action creator
 * @returns Match function that returns false if sessionId doesn't match
 */
export function matcherWithId<
  MA extends AnyAction,
  M extends (a: any) => a is MA
>(id: string, matcher: M): M {
  return ((action: AnyAction) => (
    matcher(action) && action.meta?.sessionId === id
  )) as M;
}