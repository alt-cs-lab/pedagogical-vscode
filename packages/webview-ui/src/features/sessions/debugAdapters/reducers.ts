import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { SessionsState } from "../sessionsSlice";

export type SessionReducerMapBuilder =
  (builder: Pick<ActionReducerMapBuilder<SessionsState>, "addMatcher">) => void;

const reducerMapBuilders: SessionReducerMapBuilder[] = [
  // debugger-specific reducers will go here
];

export function sessionsSliceExtraReducers(builder: ActionReducerMapBuilder<SessionsState>) {
  for (const reducerMapBuilder of reducerMapBuilders) {
    reducerMapBuilder(builder);
  }
}
