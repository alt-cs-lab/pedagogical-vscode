import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";
import { debugAdapterApi } from "../../services/debugAdapterApi";

export type ScopesState = {
  scopes: DebugProtocol.Scope[];
};

const initialState: ScopesState = {
  scopes: [],
};

const scopesSlice = createSlice({
  name: "scopes",
  initialState,
  reducers: {
    setScopes: (state, action: PayloadAction<DebugProtocol.Scope[]>) => {
      state.scopes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(debugAdapterApi.endpoints.getScopes.matchFulfilled, (state, action) => {
      state.scopes = action.payload.scopes;
    });
  }
});

export const { setScopes } = scopesSlice.actions;

export const scopesReducer = scopesSlice.reducer;
