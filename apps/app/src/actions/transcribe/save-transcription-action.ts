"use server";

import { authActionClient } from "@/actions/safe-action";
import { saveTranscription } from "@v1/supabase/mutations";
import { z } from "zod";
import "server-only";

const saveTranscriptionSchema = z.object({
  videoId: z.string(),
  title: z.string(),
});

export const saveTranscriptionAction = authActionClient
  .schema(saveTranscriptionSchema)
  .metadata({
    name: "save-transcription",
  })
  .action(async ({ parsedInput: { videoId, title }, ctx }) => {
    const { user } = ctx;
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const result = await saveTranscription(videoId, user.id, title);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error saving transcription:", error);
      return { success: false, error: "Failed to save transcription" };
    }
  });
