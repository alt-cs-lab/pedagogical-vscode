import { AnyAction } from "@reduxjs/toolkit";
import { DebugSessionAction} from "../sessionsSlice";

const registeredDebugTypes: Set<string> = new Set([
  //"python"
]);

export function isUnknownDebugType(
  action: AnyAction
): action is DebugSessionAction {
  return (
    isDebugSessionAction(action) &&
    !registeredDebugTypes.has(action.meta.debugType)
  );
}

export function isDebugSessionAction<DebugType extends string = string>(
  action: AnyAction
): action is DebugSessionAction {
  return (action.meta?.debugType satisfies DebugType) && action.meta?.sessionId;
}
