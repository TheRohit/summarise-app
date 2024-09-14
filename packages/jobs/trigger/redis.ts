import { task } from "@trigger.dev/sdk/v3";
import { client as redis } from "../../kv/src/index";
import { SequenceFlowOutput } from "./sequence";

export const pushToRedis = task({
  id: "push-to-redis",
  run: async (payload: { videoId: string; data: SequenceFlowOutput }) => {
    const { data, videoId } = payload;
    await redis.set(videoId, data, {
      ex: 60 * 60 * 24 * 7,
    });
  },
});
