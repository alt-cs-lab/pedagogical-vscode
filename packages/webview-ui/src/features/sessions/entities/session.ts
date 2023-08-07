import { createEntityAdapter } from "@reduxjs/toolkit";

export type SessionEntity = {
  id: string;
  name: string;
  type: string;
};

export const sessionsAdapter = createEntityAdapter<SessionEntity>();

export const sessionsSelectors = sessionsAdapter.getSelectors();
