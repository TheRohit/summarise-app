import { CohereEmbeddings } from "@langchain/cohere";
import type {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { traceable } from "langsmith/traceable";

import { getVideoDetails } from "../actions/youtube/get-video-details";

// Create a type-safe wrapper for traceable
function traceableFunction<T extends (...args: never[]) => unknown>(
  fn: T,
  options: { name: string },
): T {
  return traceable(fn, options) as unknown as T;
}

const ENABLE_USER_VIDEO_RELATIONSHIPS = false;

export const createPineconeIndex = traceableFunction(
  async (client: Pinecone, indexName: string, vectorDimension: number) => {
    console.log(`Checking "${indexName}"...`);
    const existingIndexes = await client.listIndexes();
    if (!existingIndexes.indexes?.some((index) => index.name === indexName)) {
      console.log(`Creating "${indexName}"...`);
      await client.createIndex({
        name: indexName,
        dimension: vectorDimension,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      console.log(
        "Creating index.... please wait for it to finish initializing.",
      );
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute
    } else {
      console.log(`"${indexName}" already exists.`);
    }
  },
  { name: "createPineconeIndex" },
);

export const updatePineconeWithTranscription = traceableFunction(
  async (
    client: Pinecone,
    indexName: string,
    transcription: string,
    videoId: string,
    title: string,
    thumbnailUrl: string,
  ) => {
    const index = client.Index(indexName);

    // Check if the video already exists in the index
    const existingVideo = await index.fetch([videoId]);

    if (!existingVideo.records[videoId]) {
      // Video doesn't exist, proceed with embedding and indexing
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 256,
        chunkOverlap: 25,
      });

      const chunks = await textSplitter.createDocuments([transcription]);
      const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY!,
        model: "embed-english-v3.0",
        inputType: "search_document",
      });

      const embeddingsArrays = await embeddings.embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " ")),
      );

      const batchSize = 100;
      let batch = [];
      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const vector = {
          id: `${videoId}_${idx}`,
          values: embeddingsArrays[idx],
          metadata: {
            videoId,
            pageContent: chunk?.pageContent,
            chunk: idx,
            title,
            thumbnailUrl,
          },
        };
        batch.push(vector);

        if (batch.length === batchSize || idx === chunks.length - 1) {
          await index.upsert(batch as PineconeRecord<RecordMetadata>[]);
          batch = [];
        }
      }

      console.log(
        `Pinecone index updated with ${chunks.length} vectors for video ${videoId}`,
      );
    } else {
      console.log(
        `Video ${videoId} already exists in the index. Skipping embedding.`,
      );
    }
  },
  { name: "updatePineconeWithTranscription" },
);

export const queryPineconeForContext = traceableFunction(
  async (
    client: Pinecone,
    indexName: string,
    question: string,
    videoId: string,
  ) => {
    console.log(`Querying Pinecone index: ${indexName}`);
    console.log(`Question: ${question}`);
    console.log(`VideoId: ${videoId}`);

    const index = client.Index(indexName);

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY!,
      model: "embed-english-v3.0",
      inputType: "search_query",
    });

    console.log("Generating query embedding...");
    const queryEmbedding = await embeddings.embedQuery(question);

    try {
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
        filter: { videoId: { $eq: videoId } },
      });

      if (queryResponse.matches.length === 0) {
        console.log("No matches found. Trying query without filter...");
        const unfiltereedQueryResponse = await index.query({
          vector: queryEmbedding,
          topK: 5,
          includeMetadata: true,
        });
        console.log(
          "Unfiltered Query Response:",
          JSON.stringify(unfiltereedQueryResponse, null, 2),
        );
      }

      const relevantContext: string = queryResponse.matches
        .map((match) => match?.metadata?.pageContent as string)
        .join("\n");

      return relevantContext;
    } catch (error) {
      console.error("Error querying Pinecone:", error);
      throw error;
    }
  },
  { name: "queryPineconeForContext" },
);

export const searchRelevantVideos = traceableFunction(
  async (
    client: Pinecone,
    indexName: string,
    question: string,
    userId?: string,
  ) => {
    console.log(
      `Searching for relevant videos in Pinecone index: ${indexName}`,
    );
    console.log(`Question: ${question}`);

    const index = client.Index(indexName);

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY!,
      model: "embed-english-v3.0",
      inputType: "search_query",
    });

    console.log("Generating query embedding...");
    const queryEmbedding = await embeddings.embedQuery(question);

    try {
      if (ENABLE_USER_VIDEO_RELATIONSHIPS && userId) {
        // const userVideos = await getUserVideoRelationships(userId);
        // const userVideoIds = userVideos.map((relation) => relation.video_id);
        // queryFilter = { videoId: { $in: userVideoIds } };
      }

      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
      });

      if (queryResponse.matches.length === 0) {
        console.log("No matches found.");
        return [];
      }

      const relevantVideos = await Promise.all(
        queryResponse.matches.map(async (match) => {
          console.log("Match:", match);
          const metadata = match.metadata as {
            pageContent: string;
            videoId: string;
          };

          const videoDetailsResponse = await getVideoDetails({
            videoId: metadata.videoId,
          });

          if (!videoDetailsResponse.success) {
            console.error(
              `No video details found for videoId: ${metadata.videoId}`,
            );
            return null;
          }

          if (!videoDetailsResponse.data) {
            console.error(
              `No video details found for videoId: ${metadata.videoId}`,
            );
            return null;
          }

          const videoDetails = videoDetailsResponse.data ?? {
            title: "",
            description: "",
            duration: "",
            author: "",
            viewCount: "",
            thumbnails: [],
          };

          return {
            videoId: metadata.videoId,
            videoTitle: videoDetails.title,
            relevantContent: metadata.pageContent,
            score: match.score,
            thumbnailUrl: videoDetails.thumbnails[0]?.url || "",
            channelTitle: videoDetails.author,
            duration: videoDetails.duration,
            viewCount: videoDetails.viewCount,
            description: videoDetails.description,
          };
        }),
      );

      const groupedVideos = relevantVideos?.reduce(
        (acc, video) => {
          if (
            !acc[video?.videoId ?? ""] ||
            (acc[video?.videoId ?? ""]?.score ?? 0) < (video?.score ?? 0)
          ) {
            acc[video?.videoId ?? ""] = video;
          }
          return acc;
        },
        {} as Record<string, (typeof relevantVideos)[0]>,
      );

      return Object.values(groupedVideos);
    } catch (error) {
      console.error("Error searching Pinecone:", error);
      throw error;
    }
  },
  { name: "searchRelevantVideos" },
);
