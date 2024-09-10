"use server";

import { authActionClient } from "@/actions/safe-action";
import { queryPineconeForContext } from "@/lib/rag-util";
import { createOpenAI } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { JSONParseError, TypeValidationError, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";
import "server-only";

const ResponseSchema = z.object({
  tldr: z.string().describe("A concise summary of the response").optional(),
  fullResponse: z
    .string()
    .describe("The full response in markdown format")
    .optional(),
});

export type AIResponse = z.infer<typeof ResponseSchema>;

const generateStreamSchema = z.object({
  question: z.string(),
  videoId: z.string(),
});

export const generateStreamAction = authActionClient
  .schema(generateStreamSchema)
  .metadata({
    name: "generate-stream",
  })
  .action(async ({ parsedInput: { question, videoId } }) => {
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY!,
    });

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const relevantContext = await queryPineconeForContext(
      pinecone,
      "video-transcriptions",
      question,
      videoId,
    );

    const stream = createStreamableValue<AIResponse>({
      tldr: "",
      fullResponse: "",
    });

    (async () => {
      try {
        const { partialObjectStream } = await streamObject({
          model: groq("llama3-groq-70b-8192-tool-use-preview"),
          prompt: `You are a helpful assistant. You are given a transcription of a YouTube video, a question about the video, and relevant context from the video. Answer the question based on the provided context, ensuring that the response is well-structured and divided into appropriate paragraphs. It should not be too long. Your response should be in markdown format, including appropriate headings, lists, and emphasis where necessary.
          Relevant Context: ${relevantContext}

          Question: ${question}
          `,
          schema: ResponseSchema,
        });

        for await (const partialObject of partialObjectStream) {
          stream.update(partialObject as AIResponse);
        }

        stream.done();
      } catch (error) {
        if (TypeValidationError.isInstance(error)) {
          return { type: "validation-error", value: error.value };
        }
        if (JSONParseError.isInstance(error)) {
          return { type: "parse-error", text: error.text };
        }
        return { type: "unknown-error", message: String(error) };
      }
    })();

    return { output: stream.value };
  });
