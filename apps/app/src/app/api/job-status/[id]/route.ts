import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  if (!id) {
    return new NextResponse("Missing id parameter", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: {"status":"connected"}\n\n`));

      let index = 0;
      const maxAttempts = 60; // 1 minute timeout
      let attempts = 0;

      while (attempts < maxAttempts) {
        const messages = await client.lrange(`job-status:${id}`, index, -1);
        console.log("messages", messages);
        if (messages.length > 0) {
          for (const message of messages) {
            const messageString =
              typeof message === "string" ? message : JSON.stringify(message);
            controller.enqueue(encoder.encode(`data: ${messageString}\n\n`));
            index++;

            const parsedMessage =
              typeof message === "object" ? message : JSON.parse(messageString);
            if (parsedMessage.status === "Job completed") {
              controller.close();
              return;
            }
          }
          attempts = 0; // Reset attempts when we receive messages
        } else {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      controller.enqueue(encoder.encode(`data: {"status":"timeout"}\n\n`));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
