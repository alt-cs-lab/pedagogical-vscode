import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";

export type ThreadsState = {
  threads: DebugProtocol.Thread[];
};

const initialState: ThreadsState = {
  threads: [],
};

const threadsSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {
    setThreads: (state, action: PayloadAction<DebugProtocol.ThreadsResponse>) => {
      state.threads = action.payload.body.threads;
    },
  },
});

export const { setThreads } = threadsSlice.actions;

export const threadsReducer = threadsSlice.reducer;
