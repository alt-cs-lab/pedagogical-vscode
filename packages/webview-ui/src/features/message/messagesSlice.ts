import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugProtocol } from "@vscode/debugprotocol";

export type MessagesState = {
  nextId: number;
  messages: MessageItem[];
};

type MessageItem = {
  id: number;
  message: DebugProtocol.ProtocolMessage;
};

const initialState: MessagesState = {
  nextId: 0,
  messages: [],
};

export const messagesSlice = createSlice({
  name: "messages",
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

export const { addMessage, clearMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
