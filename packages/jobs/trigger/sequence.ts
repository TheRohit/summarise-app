import { task } from "@trigger.dev/sdk/v3";
import { Redis } from "@upstash/redis";
import { generateChaptersTrigger } from "./chapters";
import { createPineconeIndexTask } from "./pinecone";
import { pushToRedis } from "./redis";
import { VideoInfo, transcribe } from "./transcribe";
export interface SequenceFlowOutput {
  videoDetails: VideoInfo;
  chapters: {
    chapters: { title: string; timestamp: string; summary: string }[];
  };
}

export const sequenceFlow = task({
  id: "sequence-flow",
  run: async (payload: { id: string }, { ctx }) => {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const { id } = payload;

    const runId = ctx.run.id;

    const publishStatus = async (status: string) => {
      await redis.rpush(`job-status:${runId}`, JSON.stringify({ status }));
    };

    await publishStatus("Starting transcription");
    const transcription = await transcribe.triggerAndWait({ id });
    if (transcription.ok && transcription.output.transcription) {
      const videoDetails = transcription.output.videoInfo;
      await publishStatus("Transcription completed");

      await publishStatus("Generating chapters");
      const chapters = await generateChaptersTrigger.triggerAndWait({
        input: transcription.output.transcription,
      });
      await publishStatus("Chapters generated");

      await publishStatus("Pushing data to Redis");
      await pushToRedis.triggerAndWait({
        videoId: id,
        data: {
          videoDetails,
          chapters: chapters.ok ? chapters.output : { chapters: [] },
        },
      });
      await publishStatus("Data pushed to Redis");

      await publishStatus("Creating Pinecone index");
      await createPineconeIndexTask.trigger({
        transcription: transcription.output.transcription,
        id,
      });
      await publishStatus("Pinecone index created");

      await publishStatus("Job completed");

      return {
        videoDetails,
        chapters: chapters.ok ? chapters.output : [],
      };
    }
    await publishStatus("Job failed");
  },
});
