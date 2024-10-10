"use server";

import { authActionClient } from "@/actions/safe-action";
import { searchRelevantVideos } from "@/lib/rag-util";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";
import "server-only";

const searchSchema = z.object({
  query: z.string().min(1, "Query must not be empty"),
});

export type SearchResult = {
  videoId: string;
  videoTitle: string;
  relevantContent: string;
  score: number;
};

export const searchVideosAction = authActionClient
  .schema(searchSchema)
  .metadata({
    name: "search-videos",
  })
  .action(async ({ parsedInput: { query } }) => {
    try {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const searchResults = await searchRelevantVideos(
        pinecone,
        "video-transcriptions",
        query,
      );
      console.log("searchResults", searchResults);
      return { results: searchResults };
    } catch (error) {
      console.error("Error searching videos:", error);
      return { error: "An error occurred while searching videos" };
    }
  });
