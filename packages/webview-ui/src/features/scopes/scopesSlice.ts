import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";

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
});

export const { setScopes } = scopesSlice.actions;

export const scopesReducer = scopesSlice.reducer;
