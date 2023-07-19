import { AnyAction } from "@reduxjs/toolkit";
import { DebugSessionAction } from "../sessions/sessionsSlice";
import { isUnknownDebugType } from "./strategies";

/** Verifies that an action has `meta.sessionId` and `meta.debugType` */
export function isDebugSessionAction<DebugType extends string = string>(
  action: AnyAction
): action is DebugSessionAction {
  return (action.meta?.debugType satisfies DebugType) && action.meta?.sessionId;
}

/** Matcher that returns true if the debug type is not registered in this app */
export function unknownDebugTypeMatcher(
  action: AnyAction
): action is DebugSessionAction {
  return (
    isDebugSessionAction(action) && isUnknownDebugType(action.meta.debugType)
  );
}

/** Creates a matcher that matches the action's `debugType` against the one given */
export function debugTypeMatcher(debugType: string) {
  return <A extends AnyAction>(action: A): action is DebugSessionAction & A => {
    return isDebugSessionAction(action) && action.meta.debugType === debugType;
  };
}
