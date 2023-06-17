import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DebugEvent } from "shared";

export type EventsState = {
  nextId: number;
  events: EventItem[];
};

type EventItem = {
  id: number;
  event: DebugEvent;
};

const initialState: EventsState = {
  nextId: 0,
  events: [],
};

export const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<DebugEvent>) => {
      state.events.push({ id: state.nextId++, event: action.payload });
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
});

export const { addEvent, clearEvents } = eventsSlice.actions;

export const eventsReducer = eventsSlice.reducer;
