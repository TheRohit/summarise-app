"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import { client as redis } from "@v1/kv/client";
import { saveTranscription } from "@v1/supabase/mutations";
import { getUser } from "@v1/supabase/queries";
import { z } from "zod";
import { sequenceFlow } from "../../../../../packages/jobs/trigger/sequence";
import { VideoInfo } from "../../../../../packages/jobs/trigger/transcribe";
import "server-only";
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
  id: z.string(),
});

export async function transcribe(id: string) {
  "use server";
  const user = await getUser();

  if (!id || !user.data.user) {
    return { status: "error", error: "Missing id or user" };
  }

  try {
    const cachedData = await redis.get<CachedData>(id);
    if (cachedData) {
      console.log("----- CACHED -----");
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

    if (result.status === "COMPLETED" && result.output) {
      await redis.set(id, result.output);
      console.log("----- SAVED -----");
      const title = result?.output?.videoDetails?.title ?? "Untitled";

      const error = await saveTranscription(id, user?.data?.user?.id, title);
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
      status: "error",
      error: "Transcription not completed or result is empty",
    };
  } catch (error) {
    console.error("Error in transcription process:", error);
    return {
      status: "error",
      error: "Something went wrong during transcription",
    };
  }
}
