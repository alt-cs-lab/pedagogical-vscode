import { DebugCommand, DebugRequest, DebugResponse } from "shared";
import { messageController } from "../../util";

const debugApi = {
  async debugRequestAsync<C extends DebugCommand>(
    sessionId: string,
    options: DebugRequest<C>
  ): Promise<DebugResponse<C>> {
    const result = await messageController.postRequestAndWaitAsync({
      type: "debugRequest",
      data: { sessionId, req: options },
    });
    if (result.type === "debugError") {
      throw new Error(`error from debug adapter: ${result.data.error}`);
    } else if (result.type !== "debugResponse") {
      throw new Error(`Expected debugResponse, got ${result.type} instead`);
    }
    return result.data.resp as DebugResponse<C>;
  },
};

export default debugApi;
