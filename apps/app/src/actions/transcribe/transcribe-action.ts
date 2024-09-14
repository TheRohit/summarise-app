"use server";

import { authActionClient } from "@/actions/safe-action";
import { tasks } from "@trigger.dev/sdk/v3";
import { client as redis } from "@v1/kv/client";
import "server-only";
import { z } from "zod";
import { VideoInfo } from "../../../../../packages/jobs/trigger/transcribe";

interface CachedData {
  videoDetails: VideoInfo;
  chapters:
    | {
        title: string;
        timestamp: string;
        summary: string;
      }[]
    | null;
  pineconeTaskId: string;
}

const transcribeSchema = z.object({
  id: z.string().min(1),
});

export const transcribeAction = authActionClient
  .schema(transcribeSchema)
  .metadata({
    name: "transcribe",
  })
  .action(async ({ parsedInput: { id }, ctx }) => {
    const { user } = ctx;
    if (!user) {
      return { status: "error", error: "User not authenticated" };
    }

    try {
      const cachedData = await redis.get<CachedData>(id);
      if (cachedData)
        return { status: "cached", id: cachedData.pineconeTaskId };

      const result = await tasks.trigger("sequence-flow", {
        id,
        userId: user.id,
      });

      return { status: "success", result: result };
    } catch (error) {
      console.error("Error in transcription process:", error);
      return {
        status: "error",
        error: "Something went wrong during transcription",
      };
    }
  });
