import { task } from "@trigger.dev/sdk/v3";
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
    const { id } = payload;

    const transcription = await transcribe.triggerAndWait({ id });
    if (transcription.ok && transcription.output.transcription) {
      const videoDetails = transcription.output.videoInfo;

      const chapters = await generateChaptersTrigger.triggerAndWait({
        input: transcription.output.transcription,
      });

      await pushToRedis.triggerAndWait({
        videoId: id,
        data: {
          videoDetails,
          chapters: chapters.ok ? chapters.output : { chapters: [] },
        },
      });

      await createPineconeIndexTask.trigger({
        transcription: transcription.output.transcription,
        id,
      });

      return {
        videoDetails,
        chapters: chapters.ok ? chapters.output : [],
      };
    }
  },
});
