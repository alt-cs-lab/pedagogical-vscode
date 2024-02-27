import { createAsyncThunk } from "@reduxjs/toolkit";
import rulesSlice from "./rulesSlice";
import { messageController } from "../../util";

export const loadRulesThunk = createAsyncThunk("rules/load", async (_arg, api) => {
  const rulesResp = await messageController.postRequestAndWaitAsync({
    type: "workspaceRulesRequest",
    data: undefined,
  });

  if (rulesResp.type !== "workspaceRulesResponse") {
    throw new Error(`Expected workspaceRulesResponse, got ${rulesResp.type} instead.`);
  }

  const { ruleDefinitions, sessionRules } = rulesResp.data;

  api.dispatch(rulesSlice.actions.addDefinitions({ definitions: ruleDefinitions }));
  api.dispatch(rulesSlice.actions.addSessionRules({ sessionRules }));
});
