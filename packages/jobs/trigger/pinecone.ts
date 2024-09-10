import { Pinecone } from "@pinecone-database/pinecone";
import { task } from "@trigger.dev/sdk/v3";
import {
  createPineconeIndex,
  updatePineconeWithTranscription,
} from "../../../apps/app/src/lib/rag-util";

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
export const createPineconeIndexTask = task({
  id: "pinecone-create-index",
  run: async (payload: { transcription: string; id: string }) => {
    const { transcription, id } = payload;
    await createPineconeIndex(client, "video-transcriptions", 1024);
    await updatePineconeWithTranscription(
      client,
      "video-transcriptions",
      transcription,
      id,
    );
  },
});
