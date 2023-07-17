import { AnyAction } from "@reduxjs/toolkit";
import { DebugSessionAction } from "../sessions/sessionsSlice";
import { isUnknownDebugType } from "./strategies";

export function isDebugSessionAction<DebugType extends string = string>(
  action: AnyAction
): action is DebugSessionAction {
  return (action.meta?.debugType satisfies DebugType) && action.meta?.sessionId;
}

export function unknownDebugTypeMatcher(
  action: AnyAction
): action is DebugSessionAction {
  return (
    isDebugSessionAction(action) && isUnknownDebugType(action.meta.debugType)
  );
}

export function debugTypeMatcher(debugType: string) {
  return <A extends AnyAction>(action: A): action is DebugSessionAction & A => {
    return isDebugSessionAction(action) && action.meta.debugType === debugType;
  };
}
