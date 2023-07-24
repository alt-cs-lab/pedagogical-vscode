import { FunctionComponent } from "react";
import { Reducer } from "@reduxjs/toolkit";
import { AppAddListener } from "../../../listenerMiddleware";

export default abstract class BaseSession {
  readonly id: string;
  abstract reducer: Reducer;
  abstract component: FunctionComponent<{ sessionId: string }>;
  abstract addListeners(addListener: AppAddListener): ReturnType<AppAddListener>[];

  constructor(id: string) {
    this.id = id;
  }
}

