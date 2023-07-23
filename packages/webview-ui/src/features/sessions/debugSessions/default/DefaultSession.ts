import BaseSession from "../BaseSession";
import { createReducer } from "@reduxjs/toolkit";
import { edgesAdapter, nodesAdapter, scopesAdapter, stackFramesAdapter, threadsAdapter, variablesAdapter } from "../../entities";
import * as defaultActions from "./defaultActions";
import * as defaultReducers from "./defaultReducers";

export type DefaultSessionState = DefaultSession["initialState"];

export default class DefaultSession extends BaseSession {
  readonly initialState = {
    name: "",
    threads: threadsAdapter.getInitialState(),
    stackFrames: stackFramesAdapter.getInitialState(),
    scopes: scopesAdapter.getInitialState(),
    variables: variablesAdapter.getInitialState(),
    nodes: nodesAdapter.getInitialState(),
    edges: edgesAdapter.getInitialState(),
  };

  reducer = createReducer(this.initialState, (builder) => {
    // set all debug adapter objects
    builder.addCase(
      defaultActions.setAllDebugObjects,
      defaultReducers.setAllDebugObjectsReducer
    );

    // set all react flow objects
    builder.addCase(
      defaultActions.setAllFlowObjects,
      defaultReducers.setAllFlowObjectsReducer,
    );
  });

  component = () => null;

  addListeners = () => [];

  constructor(id: string) {
    super(id);
  }
}
