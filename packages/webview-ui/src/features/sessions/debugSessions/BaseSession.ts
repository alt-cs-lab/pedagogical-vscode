import { FunctionComponent } from "react";
import { Reducer } from "redux";
import { AppAddListener } from "../../../listenerMiddleware";

export default abstract class BaseSession {
  readonly id: string;
  abstract getReducer: () => Reducer;
  abstract component: FunctionComponent<{ sessionId: string }>;
  abstract addListeners(addListener: AppAddListener): ReturnType<AppAddListener>[];

  constructor(id: string) {
    this.id = id;
  }
}

