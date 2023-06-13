import { BaseQueryFn } from "@reduxjs/toolkit/query/react";

let nextMessageId = 0;

const customBaseQuery: BaseQueryFn = (args, { signal, dispatch, getState }, extraOptions) => {
  if (Math.random() > 0.5) {
    return { error: "Too high!" };
  }
  return { data: "All good!" };
};
