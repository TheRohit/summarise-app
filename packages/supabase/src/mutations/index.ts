import { logger } from "@v1/logger";
import { createClient } from "@v1/supabase/server";
import { v4 as uuidv4 } from "uuid";
import type { Database, Tables, TablesUpdate } from "../types";

export async function updateUser(userId: string, data: TablesUpdate<"users">) {
  const supabase = createClient();

  try {
    const result = await supabase.from("users").update(data).eq("id", userId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

export const saveTranscription = async (
  videoId: string,
  userId: string,
  title: string,
) => {
  const supabase = createClient();
  const { data, error } = await supabase.from("transcriptions").insert({
    id: uuidv4(),
    video_id: videoId,
    user_id: userId,
    title,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    logger.error("Error saving transcription:", error);
    throw error;
  }

  return data;
};

export const updateUserVideoRelationship = async (
  userId: string,
  videoId: string,
) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("user_video_relationships")
      .upsert(
        {
          id: uuidv4(),
          user_id: userId,
          video_id: videoId,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,video_id" },
      );

    if (error) {
      logger.error("Error updating user-video relationship:", error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error("Error in updateUserVideoRelationship:", error);
    throw error;
  }
};
