import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { generateChaptersTrigger } from "./chapters";
import { createPineconeIndexTask } from "./pinecone";
import { VideoInfo, transcribe } from "./transcribe";

export interface SequenceFlowOutput {
  videoDetails: VideoInfo;
  chapters: {
    chapters: { title: string; timestamp: string; summary: string }[];
  };
  pineconeTaskId: string;
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

      const pineconeTask = await createPineconeIndexTask.trigger({
        transcription: transcription.output.transcription,
        id,
      });

      return {
        videoDetails,
        chapters: chapters.ok ? chapters.output : null,
        pineconeTaskId: pineconeTask.id,
      };
    }
  },
});
