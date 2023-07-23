import { UnsubscribeListener } from "@reduxjs/toolkit";
import { FunctionComponent } from "react";
import { Reducer } from "redux";
import { AppAddListener } from "../../../listenerMiddleware";

export default abstract class BaseSession {
  readonly id: string;
  abstract reducer: Reducer;
  abstract component: FunctionComponent;
  abstract addListeners(addListener: AppAddListener): UnsubscribeListener[];

  constructor(id: string) {
    this.id = id;
  }
}

