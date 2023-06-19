import { createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";
import { debugAdapterApi } from "../../services/debugAdapterApi";

export type VariablesState = {
  variables: DebugProtocol.Variable[];
};

const initialState: VariablesState = {
  variables: [],
};

const variablesSlice = createSlice({
  name: "variables",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(debugAdapterApi.endpoints.getVariables.matchFulfilled, (state, action) => {
      state.variables = action.payload.variables;
    });
  },
});

export const variablesReducer = variablesSlice.reducer;
