"use server";

import { updateUserVideoRelationship } from "@v1/supabase/mutations";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import "server-only";

const saveIndexSchema = z.object({
  videoId: z.string(),
});

export const saveIndexAction = authActionClient
  .schema(saveIndexSchema)
  .metadata({
    name: "save-index",
  })
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    const result = await updateUserVideoRelationship(user.id, input.videoId);

    return result;
  });
