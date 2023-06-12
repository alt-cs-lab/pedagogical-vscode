import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";

export type AppState = {
  nextId: number;
  messages: MessageItem[];
};

type MessageItem = {
  id: number;
  message: DebugProtocol.ProtocolMessage;
};

// function getInitialState(): AppState {
//   const state = vscode.getState();
//   return isAppState(state) ? state : { nextId: 0, messages: [] };
// }

// function isAppState(state: unknown): state is AppState {
//   return state !== undefined && (state as AppState).messages !== undefined;
// }

const initialState: AppState = {
  nextId: 0,
  messages: [],
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<DebugProtocol.ProtocolMessage>) => {
      const msg = { id: state.nextId++, message: action.payload };
      state.messages.push(msg);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = appSlice.actions;

export default appSlice.reducer;
