"use server";

import type { videoInfo } from "@distube/ytdl-core";
import { tasks } from "@trigger.dev/sdk/v3";
import { sequenceFlow } from "../../../../../packages/jobs/trigger/sequence";
import { client as redis } from "../../../../../packages/kv/src";
import "server-only";
interface CachedData {
  videoDetails: videoInfo;
  chapters:
    | {
        title: string;
        timestamp: string;
        summary: string;
      }[]
    | null;
  pineconeTaskId: string;
}

export async function transcribe(id: string) {
  "use server";
  try {
    const cachedData = await redis.get<CachedData>(id);
    if (cachedData) {
      return {
        ...cachedData,
        status: "complete",
        cached: true,
      };
    }

    const result = await tasks.triggerAndPoll<typeof sequenceFlow>(
      "sequence-flow",
      {
        id,
      },
    );

    if (result.status === "COMPLETED") {
      await redis.set(id, result.output);
      return {
        ...result.output,
        status: "complete",
        cached: false,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}
