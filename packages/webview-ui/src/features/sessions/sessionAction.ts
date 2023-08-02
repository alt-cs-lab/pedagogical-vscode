import { PayloadAction, createAction } from "@reduxjs/toolkit";

/**
 * An action for a session. This is a PayloadAction with `sessionId` in its `meta`.
 * An action *must* have a `sessionId` in its `meta` or it won't be routed to that session's reducer!
 *
 * This takes the same arguments as PayloadAction. If `M` is given, `sessionId` will be appended to it.
 */
export type SessionAction<
  P = void,
  T extends string = string,
  M = void,
  E = never
> = PayloadAction<P, T, M & { sessionId: string; }, E>;

/**
 * Returns an action creator that takes arguments for a sessionId and a payload.
 * The resulting action will have a `sessionId` in its `meta` property, which is required
 * by all session actions.
 *
 * This is a helper method that calls `createAction` with a prepare function argument.
 * Use `createAction` manually if you want to customize the prepare function.
 */
export function createSessionAction<
  P = void,
  T extends string = string
>(type: T) {
  return createAction(
    type,
    (sessionId: string, payload: P) => ({
      payload,
      meta: { sessionId },
    }),
  );
}
