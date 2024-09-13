import { videoInfo } from "@distube/ytdl-core";
import { tasks } from "@trigger.dev/sdk/v3";
import { client as redis } from "@v1/kv/client";
import { saveTranscription } from "@v1/supabase/mutations";
import { getUser } from "@v1/supabase/queries";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sequenceFlow } from "../../../../../../packages/jobs/trigger/sequence";

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const user = await getUser();

  if (!id || !user.data.user) {
    return NextResponse.json({ error: "Missing id or user" }, { status: 400 });
  }

  try {
    transcribeSchema.parse({ id });

    const cachedData = await redis.get<CachedData>(id);
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        status: "complete",
        cached: true,
      });
    }

    const result = await tasks.triggerAndPoll<typeof sequenceFlow>(
      "sequence-flow",
      {
        id,
      },
    );

    if (result.status === "COMPLETED" && result.output) {
      await redis.set(id, result.output);
      const title = result?.output?.videoDetails?.title ?? "Untitled";

      const error = await saveTranscription(id, user?.data?.user?.id, title);
      if (error) {
        console.error("Error saving transcription:", error);
      }

      return NextResponse.json({
        ...result.output,
        status: "complete",
        cached: false,
      });
    }

    return NextResponse.json(
      {
        error: "Transcription not completed or result is empty",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error in transcription process:", error);
    return NextResponse.json(
      {
        error: "Something went wrong during transcription",
      },
      { status: 500 },
    );
  }
}
