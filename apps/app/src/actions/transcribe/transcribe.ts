"use server";

import { authActionClient } from "@/actions/safe-action";
import type { videoInfo } from "@distube/ytdl-core";
import { tasks } from "@trigger.dev/sdk/v3";

import { z } from "zod";
import { sequenceFlow } from "../../../../../packages/jobs/trigger/sequence";
import { client as redis } from "../../../../../packages/kv/src";
import "server-only";
import { saveTranscription } from "@v1/supabase/mutations";

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

const transcribeSchema = z.object({
  id: z.string(),
});

export const transcribeAction = authActionClient
  .schema(transcribeSchema)
  .metadata({
    name: "transcribe",
  })
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
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
        const title = result.output?.videoDetails?.title ?? "Untitled";

        const error = await saveTranscription(id, user.id, title);
        if (error) {
          console.error("Error saving transcription:", error);
        }

        return {
          ...result.output,
          status: "complete",
          cached: false,
        };
      }

      return {
        error: "Transcription not completed",
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Something went wrong",
      };
    }
  });
